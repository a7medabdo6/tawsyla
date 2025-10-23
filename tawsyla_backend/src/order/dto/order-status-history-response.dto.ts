import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class OrderStatusHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  // @ApiProperty({ enum: OrderStatus })
  // previousStatus: OrderStatus;

  @ApiProperty({ enum: OrderStatus })
  newStatus: OrderStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  changedByUserId?: string;

  @ApiPropertyOptional()
  changedByUserRole?: string;

  @ApiPropertyOptional()
  changeReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
