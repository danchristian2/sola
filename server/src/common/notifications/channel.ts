export interface NotificationMessage {
  recipientId: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationChannel {
  send(message: NotificationMessage): Promise<void>;
}

export class InAppNotificationChannel implements NotificationChannel {
  async send(_message: NotificationMessage): Promise<void> {
    // Persisted in-app notifications land in Phase 4+.
  }
}
