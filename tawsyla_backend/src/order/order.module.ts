import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Address } from '../address/entities/address.entity';
import { OfferModule } from '../offer/offer.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { PushNotificationModule } from '../push-notifications/push-notification.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderStatusHistory,
      Product,
      ProductVariant,
      Address,
    ]),
    OfferModule,
    LoyaltyModule,
    PushNotificationModule,
    UsersModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
