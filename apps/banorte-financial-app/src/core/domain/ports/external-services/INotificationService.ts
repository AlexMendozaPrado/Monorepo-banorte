export interface NotificationPayload {
  recipient: string;
  subject: string;
  message: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  metadata?: Record<string, unknown>;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<void>;
  sendBatch(payloads: NotificationPayload[]): Promise<void>;
}
