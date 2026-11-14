import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface LiveEventPayload {
  type: 'order_created' | 'order_updated' | 'order_status_changed' | 'ticket_printed';
  branch_id: number;
  restaurant_id: number;
  target_roles: string[]; // ['kitchen', 'cashier', 'manager']
  data: any;
  timestamp: string;
}

@Injectable()
export class LiveEventsService {
  private readonly logger = new Logger(LiveEventsService.name);
  private readonly events$ = new Subject<LiveEventPayload>();

  publish(event: Omit<LiveEventPayload, 'timestamp'>) {
    const fullEvent: LiveEventPayload = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.logger.log(`[LiveEvent] ${fullEvent.type} for branch #${fullEvent.branch_id}`);
    this.events$.next(fullEvent);
  }

  getEventsStream(
    branchId?: number,
    role?: string,
    restaurantId?: number,
  ): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      filter((evt) => {
        if (restaurantId != null && evt.restaurant_id !== restaurantId) {
          return false;
        }
        if (branchId != null && evt.branch_id !== branchId) {
          return false;
        }
        if (restaurantId != null && branchId == null) {
          return false;
        }
        if (role && evt.target_roles.length > 0 && !evt.target_roles.includes(role) && !evt.target_roles.includes('all')) {
          return false;
        }
        return true;
      }),
      map((evt) => ({
        data: evt,
        type: evt.type,
      } as MessageEvent)),
    );
  }
}
