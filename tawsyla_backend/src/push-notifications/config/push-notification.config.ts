import { registerAs } from '@nestjs/config';
import { PushNotificationConfig } from './push-notification-config.type';

export default registerAs(
  'pushNotification',
  (): PushNotificationConfig => ({
    expo: {
      accessToken: process.env.EXPO_ACCESS_TOKEN || '',
    },
  }),
);
