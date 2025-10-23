import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../entities/order.entity';
import { OrderStatusHistoryResponseDto } from './order-status-history-response.dto';
// src/orders/dto/order-list-response.dto.ts

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId?: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  variantName?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  shippingAddressId?: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  shippingCost: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  couponUsageId?: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  adminNotes?: string;

  @ApiProperty()
  confirmedAt?: Date;

  @ApiProperty()
  shippedAt?: Date;

  @ApiProperty()
  deliveredAt?: Date;

  @ApiProperty()
  cancelledAt?: Date;

  @ApiProperty()
  trackingNumber?: string;

  @ApiProperty()
  trackingUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: [OrderStatusHistoryResponseDto] })
  statusHistory?: OrderStatusHistoryResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ description: 'Total number of orders' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}
