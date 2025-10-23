import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { UsersModule } from '../users/users.module';
import pushNotificationConfig from './config/push-notification.config';

@Module({
  imports: [ConfigModule.forFeature(pushNotificationConfig), UsersModule],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
