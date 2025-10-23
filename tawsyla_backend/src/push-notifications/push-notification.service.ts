import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PushNotificationConfig } from './config/push-notification-config.type';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private expo: Expo;

  constructor(private configService: ConfigService) {
    const accessToken =
      this.configService.get('pushNotification')?.expo?.accessToken;

    // if (!accessToken) {
    //   this.logger.warn('EXPO_ACCESS_TOKEN not found. Push notifications will be disabled.');
    //   return;
    // }

    this.expo = new Expo();
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(
    pushToken: string,
    notification: PushNotificationData,
  ): Promise<ExpoPushTicket | null> {
    if (!this.expo) {
      this.logger.warn(
        'Expo client not initialized. Skipping push notification.',
      );
      return null;
    }

    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.error(
        `Push token ${pushToken} is not a valid Expo push token`,
      );
      return null;
    }

    try {
      const message: ExpoPushMessage = {
        to: pushToken,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.sound || 'default',
        badge: notification.badge,
        channelId: notification.channelId,
      };

      const ticket = await this.expo.sendPushNotificationsAsync([message]);
      this.logger.log(`Push notification sent successfully to ${pushToken}`);

      return ticket[0];
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to ${pushToken}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    pushTokens: string[],
    notification: PushNotificationData,
  ): Promise<ExpoPushTicket[]> {
    if (!this.expo) {
      this.logger.warn(
        'Expo client not initialized. Skipping push notifications.',
      );
      return [];
    }

    const validTokens = pushTokens.filter((token) => {
      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`Invalid push token: ${token}`);
        return false;
      }
      return true;
    });

    if (validTokens.length === 0) {
      this.logger.warn('No valid push tokens provided');
      return [];
    }

    try {
      const messages: ExpoPushMessage[] = validTokens.map((token) => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.sound || 'default',
        badge: notification.badge,
        channelId: notification.channelId,
      }));

      const tickets = await this.expo.sendPushNotificationsAsync(messages);
      this.logger.log(
        `Push notifications sent successfully to ${validTokens.length} devices`,
      );

      return tickets;
    } catch (error) {
      this.logger.error('Failed to send push notifications:', error);
      return [];
    }
  }

  /**
   * Send order created notification
   */
  async sendOrderCreatedNotification(
    pushToken: string,
    orderNumber: string,
    total: number,
    orderId: string,
  ): Promise<ExpoPushTicket | null> {
    const notification: PushNotificationData = {
      title: 'Order Confirmed! 🎉',
      body: `Your order ${orderNumber} has been created successfully. Total: $${total.toFixed(2)}`,
      data: {
        type: 'order_created',
        orderId,
        orderNumber,
        total,
      },
      sound: 'default',
      badge: 1,
    };

    return this.sendToDevice(pushToken, notification);
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdateNotification(
    pushToken: string,
    orderNumber: string,
    status: string,
    orderId: string,
  ): Promise<ExpoPushTicket | null> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      processing: 'Your order is being processed.',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
      refunded: 'Your order has been refunded.',
    };

    const message =
      statusMessages[status] ||
      `Your order status has been updated to ${status}`;

    const notification: PushNotificationData = {
      title: `Order ${orderNumber} Update`,
      body: message,
      data: {
        type: 'order_status_update',
        orderId,
        orderNumber,
        status,
      },
      sound: 'default',
    };

    return this.sendToDevice(pushToken, notification);
  }

  /**
   * Send welcome notification
   */
  async sendWelcomeNotification(
    pushToken: string,
    userName: string,
  ): Promise<ExpoPushTicket | null> {
    const notification: PushNotificationData = {
      title: 'Welcome to Tawsyla! 👋',
      body: `Hello ${userName}, welcome to our platform!`,
      data: {
        type: 'welcome',
      },
      sound: 'default',
    };

    return this.sendToDevice(pushToken, notification);
  }

  /**
   * Send promotional notification to all users
   */
  async sendPromotionalNotification(
    allUserTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ success: number; failed: number; total: number }> {
    if (!this.expo) {
      this.logger.warn(
        'Expo client not initialized. Skipping promotional notifications.',
      );
      return { success: 0, failed: 0, total: 0 };
    }

    const validTokens = allUserTokens.filter((token) => {
      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`Invalid push token: ${token}`);
        return false;
      }
      return true;
    });

    if (validTokens.length === 0) {
      this.logger.warn(
        'No valid push tokens found for promotional notification',
      );
      return { success: 0, failed: 0, total: 0 };
    }

    const notification: PushNotificationData = {
      title,
      body,
      data: {
        type: 'promotion',
        ...data,
      },
      sound: 'default',
    };

    let success = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the Expo API
    const batchSize = 100;
    for (let i = 0; i < validTokens.length; i += batchSize) {
      const batch = validTokens.slice(i, i + batchSize);

      try {
        const messages: ExpoPushMessage[] = batch.map((token) => ({
          to: token,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
        }));

        const tickets = await this.expo.sendPushNotificationsAsync(messages);

        // Count successful and failed tickets
        tickets.forEach((ticket) => {
          if (ticket.status === 'ok') {
            success++;
          } else {
            failed++;
            this.logger.warn(
              `Failed to send promotional notification: ${ticket.message}`,
            );
          }
        });

        this.logger.log(
          `Promotional notification batch sent: ${i + 1}-${Math.min(i + batchSize, validTokens.length)} of ${validTokens.length}`,
        );

        // Add small delay between batches to be respectful to the API
        if (i + batchSize < validTokens.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        this.logger.error(
          `Failed to send promotional notification batch ${i}-${i + batchSize}:`,
          error,
        );
        failed += batch.length;
      }
    }

    this.logger.log(
      `Promotional notification completed: ${success} successful, ${failed} failed, ${validTokens.length} total`,
    );

    return {
      success,
      failed,
      total: validTokens.length,
    };
  }
}
