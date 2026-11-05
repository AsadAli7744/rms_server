import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhookEventType } from '../../common/enums';

export type WebhookDispatchPayload = Record<string, unknown>;

@Injectable()
export class WebhookDispatchService {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepo: Repository<WebhookDelivery>,
  ) {}

  /**
   * Fire all matching endpoints for a restaurant (and optional branch scope).
   */
  async dispatch(
    restaurantId: number,
    event: WebhookEventType,
    payload: WebhookDispatchPayload,
    branchId?: number | null,
  ): Promise<void> {
    const endpoints = await this.endpointRepo.find({
      where: { restaurant_id: restaurantId, is_active: true, is_archived: false },
    });
    const eventStr = String(event);
    const matched = endpoints.filter((ep) => {
      const subs = ep.subscribed_events ?? [];
      if (!subs.length) {
        return false;
      }
      const wantsAll = subs.includes('*');
      if (!wantsAll && !subs.includes(eventStr)) {
        return false;
      }
      if (ep.branch_id != null) {
        if (branchId == null || ep.branch_id !== branchId) {
          return false;
        }
      }
      return true;
    });
    await Promise.all(
      matched.map((ep) => this.deliver(ep.id, eventStr, payload)),
    );
  }

  private async deliver(
    endpointId: number,
    eventType: string,
    payload: WebhookDispatchPayload,
  ): Promise<void> {
    const ep = await this.endpointRepo.findOne({ where: { id: endpointId } });
    if (!ep || !ep.is_active || ep.is_archived) {
      return;
    }
    const bodyObj = {
      event: eventType,
      payload,
      sent_at: new Date().toISOString(),
    };
    const body = JSON.stringify(bodyObj);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': eventType,
    };
    if (ep.secret) {
      const sig = createHmac('sha256', ep.secret).update(body).digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${sig}`;
    }
    const delivery = this.deliveryRepo.create({
      endpoint_id: ep.id,
      event_type: eventType,
      request_body: bodyObj as Record<string, unknown>,
      response_status: null,
      response_body_snippet: null,
      success: false,
      error_message: null,
    });
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15_000);
      const res = await fetch(ep.target_url, {
        method: 'POST',
        headers,
        body,
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const text = await res.text();
      delivery.response_status = res.status;
      delivery.response_body_snippet = text.slice(0, 4000);
      delivery.success = res.ok;
      if (!res.ok) {
        delivery.error_message = `HTTP ${res.status}`;
      }
    } catch (e) {
      delivery.success = false;
      delivery.error_message =
        e instanceof Error ? e.message : 'Unknown delivery error';
      this.logger.warn(
        `Webhook delivery failed endpoint=${ep.id} event=${eventType}: ${delivery.error_message}`,
      );
    }
    await this.deliveryRepo.save(delivery);
  }
}
