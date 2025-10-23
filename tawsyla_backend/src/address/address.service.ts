import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const { isDefault, ...addressData } = createAddressDto;

    // If this address should be default, unset other default addresses first
    if (isDefault) {
      await this.unsetOtherDefaultAddresses(userId);
    }

    const address = this.addressRepository.create({
      ...addressData,
      userId,
      isDefault: isDefault || false,
    });

    return this.addressRepository.save(address);
  }

  async updateAddress(
    userId: number,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const { isDefault, ...updateData } = updateAddressDto;

    // If this address should be default, unset other default addresses first
    if (isDefault && !address.isDefault) {
      await this.unsetOtherDefaultAddresses(userId);
    }

    Object.assign(address, updateData);
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: number, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If deleting the default address, set another address as default
    if (address.isDefault) {
      const otherAddress = await this.addressRepository.findOne({
        where: { userId, isActive: true, id: addressId },
      });

      if (otherAddress) {
        otherAddress.isDefault = true;
        await this.addressRepository.save(otherAddress);
      }
    }

    await this.addressRepository.remove(address);
  }

  async getUserAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async getAddressById(userId: number, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId, isActive: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async getDefaultAddress(userId: number): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { userId, isDefault: true, isActive: true },
    });
  }

  async setDefaultAddress(userId: number, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId, isActive: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.isDefault) {
      throw new BadRequestException('Address is already the default address');
    }

    // Unset other default addresses
    await this.unsetOtherDefaultAddresses(userId);

    // Set this address as default
    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  async getAddressesCount(userId: number): Promise<number> {
    return this.addressRepository.count({
      where: { userId, isActive: true },
    });
  }

  private async unsetOtherDefaultAddresses(userId: number): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}
