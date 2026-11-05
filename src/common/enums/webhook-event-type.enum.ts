/**
 * Outbound webhook event identifiers. Extend as domains are implemented.
 */
export enum WebhookEventType {
  ORDER_PLACED = 'order.placed',
  ORDER_STATUS_CHANGED = 'order.status_changed',
  ORDER_PAYMENT_RECORDED = 'order.payment_recorded',
  RESERVATION_CREATED = 'reservation.created',
  RESERVATION_STATUS_CHANGED = 'reservation.status_changed',
  MENU_PUBLISHED = 'menu.published',
  TEST_PING = 'webhook.test_ping',
}
