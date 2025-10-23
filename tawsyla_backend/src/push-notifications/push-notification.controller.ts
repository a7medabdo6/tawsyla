import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PushNotificationService } from './push-notification.service';
import { UsersService } from '../users/users.service';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { ApiBearerAuth, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

export interface SendNotificationDto {
  pushToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PromotionalNotificationDto {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// @ApiBearerAuth()
// @Roles(RoleEnum.admin)
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Push Notifications')
@Controller({
  path: 'push-notifications',
  version: '1',
})
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        pushToken: {
          type: 'string',
          example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          description: 'Expo push token for the target device',
        },
        title: {
          type: 'string',
          example: 'New Message',
          description: 'Notification title',
        },
        body: {
          type: 'string',
          example: 'You have a new message from John',
          description: 'Notification body text',
        },
        data: {
          type: 'object',
          example: { messageId: '123', senderId: '456' },
          description: 'Additional data to send with the notification',
        },
      },
      required: ['pushToken', 'title', 'body'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notification sent successfully' },
      },
    },
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    const result = await this.pushNotificationService.sendToDevice(
      sendNotificationDto.pushToken,
      {
        title: sendNotificationDto.title,
        body: sendNotificationDto.body,
        data: sendNotificationDto.data,
      },
    );

    return {
      success: !!result,
      message: result
        ? 'Notification sent successfully'
        : 'Failed to send notification',
    };
  }

  @Post('test-order-created')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        pushToken: {
          type: 'string',
          example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          description: 'Expo push token for the target device',
        },
        orderNumber: {
          type: 'string',
          example: 'ORD-2024-001',
          description: 'Order number',
        },
        total: {
          type: 'number',
          example: 99.99,
          description: 'Order total amount',
        },
        orderId: {
          type: 'string',
          example: 'uuid-here',
          description: 'Order unique identifier',
        },
      },
      required: ['pushToken', 'orderNumber', 'total', 'orderId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order created notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Order created notification sent successfully',
        },
      },
    },
  })
  async testOrderCreatedNotification(
    @Body()
    body: {
      pushToken: string;
      orderNumber: string;
      total: number;
      orderId: string;
    },
  ) {
    const result =
      await this.pushNotificationService.sendOrderCreatedNotification(
        body.pushToken,
        body.orderNumber,
        body.total,
        body.orderId,
      );

    return {
      success: !!result,
      message: result
        ? 'Order created notification sent successfully'
        : 'Failed to send notification',
    };
  }

  @Post('send-promotional')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '🎉 Special Sale! 50% Off Everything',
          description: 'Promotional notification title',
        },
        body: {
          type: 'string',
          example:
            "Don't miss out on our biggest sale of the year! Use code SALE50 at checkout.",
          description: 'Promotional notification body text',
        },
        data: {
          type: 'object',
          example: {
            promoCode: 'SALE50',
            discount: 50,
            expiresAt: '2024-12-31T23:59:59Z',
            category: 'sale',
          },
          description:
            'Additional promotional data (promo codes, discounts, etc.)',
        },
      },
      required: ['title', 'body'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Promotional notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Promotional notification sent to 1250 users (15 failed)',
        },
        stats: {
          type: 'object',
          properties: {
            success: {
              type: 'number',
              example: 1250,
              description: 'Number of successful notifications',
            },
            failed: {
              type: 'number',
              example: 15,
              description: 'Number of failed notifications',
            },
            total: {
              type: 'number',
              example: 1265,
              description: 'Total number of users targeted',
            },
          },
        },
      },
    },
  })
  async sendPromotionalNotification(
    @Body() promotionalDto: PromotionalNotificationDto,
  ) {
    // Get all user push tokens
    const allUserTokens = await this.usersService.getAllUserPushTokens();

    if (allUserTokens.length === 0) {
      return {
        success: false,
        message: 'No users with push tokens found',
        stats: { success: 0, failed: 0, total: 0 },
      };
    }

    // Send promotional notification to all users
    const result =
      await this.pushNotificationService.sendPromotionalNotification(
        allUserTokens,
        promotionalDto.title,
        promotionalDto.body,
        promotionalDto.data,
      );

    return {
      success: result.success > 0,
      message: `Promotional notification sent to ${result.success} users (${result.failed} failed)`,
      stats: result,
    };
  }
}
