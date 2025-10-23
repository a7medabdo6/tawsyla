import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'The new status for the order',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus, { message: 'Status must be a valid order status' })
  status: OrderStatus;

  @ApiProperty({
    description: 'Reason for the status change (optional)',
    example: 'Order confirmed by customer',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Change reason must be a string' })
  @MaxLength(500, { message: 'Change reason cannot exceed 500 characters' })
  changeReason?: string;

  @ApiProperty({
    description: 'Additional notes about the status change (optional)',
    example: 'Customer requested expedited shipping',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;
}
