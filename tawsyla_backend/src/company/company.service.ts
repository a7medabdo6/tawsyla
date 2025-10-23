import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Company, CompanyType } from './entities/company.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService extends TypeOrmCrudService<Company> {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super(companyRepository);
  }

  async createCompanyForUser(
    dto: CreateCompanyDto,
    userId: string,
  ): Promise<Company> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: +userId || 1 },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a company
    if (user.company) {
      throw new ConflictException('User already has a company');
    }

    // Check if user is marked as trader
    // if (!user.isTrader) {
    //   throw new ForbiddenException('User must be a trader to create a company');
    // }

    // Create company
    const company = this.companyRepository.create({
      ...dto,
      userId,
      user,
    });

    return await this.companyRepository.save(company);
  }

  async updateUserCompany(
    req: CrudRequest,
    dto: UpdateCompanyDto,
    userId: string,
  ): Promise<Company> {
    const companyId = (req?.parsed?.paramsFilter?.[0]?.value ?? null) as string;
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user owns this company
    if (company.userId !== userId) {
      throw new ForbiddenException('You can only update your own company');
    }

    // Update company
    Object.assign(company, dto);
    return await this.companyRepository.save(company);
  }

  async deleteUserCompany(req: any, userId: string): Promise<void> {
    const company = await this.findOne(req);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user owns this company
    if (company.userId !== userId) {
      throw new ForbiddenException('You can only delete your own company');
    }

    await this.companyRepository.remove(company);
  }

  async findUserCompany(userId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!company) {
      throw new NotFoundException('User has no company');
    }

    return company;
  }

  async toggleCompanyActive(
    companyId: string,
    userId: string,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user owns this company
    if (company.userId !== userId) {
      throw new ForbiddenException('You can only modify your own company');
    }

    company.isActive = !company.isActive;
    return await this.companyRepository.save(company);
  }

  async findCompaniesByType(
    req: CrudRequest,
    type: string,
  ): Promise<Company[]> {
    // Validate company type
    if (!Object.values(CompanyType).includes(type as CompanyType)) {
      throw new BadRequestException('Invalid company type');
    }

    const companies = await this.companyRepository.find({
      where: {
        type: type as CompanyType,
        isActive: true,
      },
      relations: ['user'],
      order: { rating: 'DESC' },
    });

    return companies;
  }

  async findNearbyCompanies(lat, lng, radius): Promise<Company[]> {
    if (!lat || !lng) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    // Using raw query for geographical distance calculation
    // This is a simplified version - you might want to use PostGIS for production
    const companies = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.user', 'user')
      .where('company.isActive = :isActive', { isActive: true })
      .andWhere('company.latitude IS NOT NULL')
      .andWhere('company.longitude IS NOT NULL')
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(company.latitude)) * 
            cos(radians(company.longitude) - radians(:lng)) + 
            sin(radians(:lat)) * sin(radians(company.latitude))
          )
        ) <= :radius`,
        {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: parseFloat(radius),
        },
      )
      .orderBy('company.rating', 'DESC')
      .getMany();

    return companies;
  }

  async updateCompanyRating(
    companyId: string,
    newRating: number,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.rating = newRating;
    return await this.companyRepository.save(company);
  }

  async incrementTotalOrders(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.totalOrders += 1;
    return await this.companyRepository.save(company);
  }

  async getCompanyStats(userId: string): Promise<any> {
    const company = await this.findUserCompany(userId);

    return {
      companyId: company.id,
      totalOrders: company.totalOrders,
      rating: company.rating,
      isActive: company.isActive,
      isVerified: company.isVerified,
      createdAt: company.createdAt,
    };
  }
}
