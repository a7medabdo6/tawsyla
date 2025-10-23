import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';

@ApiTags('Addresses')
@Controller('addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.user)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    type: [AddressResponseDto],
  })
  async getUserAddresses(@Request() req: any): Promise<AddressResponseDto[]> {
    const addresses = await this.addressService.getUserAddresses(req.user.id);
    return addresses.map((address) => this.mapAddressToResponseDto(address));
  }

  @Get('default')
  @ApiOperation({ summary: 'Get user default address' })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No default address found',
  })
  async getDefaultAddress(
    @Request() req: any,
  ): Promise<AddressResponseDto | null> {
    const address = await this.addressService.getDefaultAddress(req.user.id);
    return address ? this.mapAddressToResponseDto(address) : null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async getAddressById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    const address = await this.addressService.getAddressById(req.user.id, id);
    return this.mapAddressToResponseDto(address);
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  async createAddress(
    @Request() req: any,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.addressService.createAddress(
      req.user.id,
      createAddressDto,
    );
    return this.mapAddressToResponseDto(address);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async updateAddress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.addressService.updateAddress(
      req.user.id,
      id,
      updateAddressDto,
    );
    return this.mapAddressToResponseDto(address);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({
    status: 200,
    description: 'Address set as default successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - address already default',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async setDefaultAddress(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    const address = await this.addressService.setDefaultAddress(
      req.user.id,
      id,
    );
    return this.mapAddressToResponseDto(address);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({
    status: 204,
    description: 'Address deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async deleteAddress(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<void> {
    await this.addressService.deleteAddress(req.user.id, id);
  }

  @Get('count/total')
  @ApiOperation({ summary: 'Get user addresses count' })
  @ApiResponse({
    status: 200,
    description: 'Addresses count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 3,
        },
      },
    },
  })
  async getAddressesCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.addressService.getAddressesCount(req.user.id);
    return { count };
  }

  private mapAddressToResponseDto(address: any): AddressResponseDto {
    return {
      id: address.id,
      userId: address.userId,
      phone: address.phone,
      city: address.city,
      state: address.state,
      additionalInfo: address.additionalInfo,
      isDefault: address.isDefault,
      isActive: address.isActive,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
