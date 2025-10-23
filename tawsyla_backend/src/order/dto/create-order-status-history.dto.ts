import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderStatusHistoryDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Previous order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  previousStatus: OrderStatus;

  @ApiProperty({ description: 'New order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  newStatus: OrderStatus;

  @ApiPropertyOptional({
    description: 'Additional notes about the status change',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID of the user who made the change' })
  @IsOptional()
  @IsUUID()
  changedByUserId?: string;

  @ApiPropertyOptional({ description: 'Role of the user who made the change' })
  @IsOptional()
  @IsString()
  changedByUserRole?: string;

  @ApiPropertyOptional({ description: 'Reason for the status change' })
  @IsOptional()
  @IsString()
  changeReason?: string;
}
