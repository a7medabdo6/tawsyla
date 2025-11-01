import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { FilesService } from '../files/files.service';
import { FileType } from '../files/domain/file';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Create new settings (only one settings record should exist)
   */
  async create(
    createSettingsDto: CreateSettingsDto,
  ): Promise<SettingsResponseDto> {
    // Check if settings already exist
    const existingSettings = await this.settingsRepository.findOne({
      where: { isActive: true },
    });
    console.log(existingSettings, 'existingSettings');
    if (existingSettings) {
      throw new BadRequestException(
        'Settings already exist. Use update endpoint to modify existing settings.',
      );
    }

    // Handle logo file validation
    let logo: FileType | null | undefined = undefined;
    if (createSettingsDto.logo?.id) {
      const fileObject = await this.filesService.findById(
        createSettingsDto.logo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            logo: 'imageNotExists',
          },
        });
      }
      logo = fileObject;
    } else if (createSettingsDto.logo === null) {
      logo = null;
    }

    const settings = this.settingsRepository.create({
      ...createSettingsDto,
      logo,
    });
    const savedSettings = await this.settingsRepository.save(settings);

    this.logger.log('Settings created successfully');
    return this.mapToResponseDto(savedSettings);
  }

  /**
   * Get current settings
   */
  async findOne(): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepository.findOne({});

    if (!settings) {
      throw new NotFoundException(
        'Settings not found. Please create settings first.',
      );
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Update existing settings
   */
  async update(
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepository.findOne({});

    if (!settings) {
      throw new NotFoundException(
        'Settings not found. Please create settings first.',
      );
    }

    // Handle logo file validation
    let logo: FileType | null | undefined = undefined;
    if (updateSettingsDto.logo?.id) {
      const fileObject = await this.filesService.findById(
        updateSettingsDto.logo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            logo: 'imageNotExists',
          },
        });
      }
      logo = fileObject;
    } else if (updateSettingsDto.logo === null) {
      logo = null;
    }

    // Update only provided fields
    const updateData = {
      ...updateSettingsDto,
      ...(logo !== undefined && { logo }),
    };
    Object.assign(settings, updateData);
    const updatedSettings = await this.settingsRepository.save(settings);

    this.logger.log('Settings updated successfully');
    return this.mapToResponseDto(updatedSettings);
  }

  /**
   * Delete settings (use with caution)
   */
  async remove(): Promise<void> {
    const settings = await this.settingsRepository.findOne({});

    if (!settings) {
      throw new NotFoundException('Settings not found.');
    }

    await this.settingsRepository.remove(settings);
    this.logger.log('Settings deleted successfully');
  }

  /**
   * Get settings for public use (only active settings)
   */
  async getPublicSettings(): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepository.findOne({
      where: { isActive: true },
    });

    if (!settings) {
      throw new NotFoundException('Settings not found or inactive.');
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Toggle settings active status
   */
  async toggleActiveStatus(): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepository.findOne({});

    if (!settings) {
      throw new NotFoundException('Settings not found.');
    }

    settings.isActive = !settings.isActive;
    const updatedSettings = await this.settingsRepository.save(settings);

    this.logger.log(
      `Settings ${updatedSettings.isActive ? 'activated' : 'deactivated'} successfully`,
    );
    return this.mapToResponseDto(updatedSettings);
  }

  /**
   * Get specific settings fields for public use
   */
  async getPublicContactInfo() {
    const settings = await this.settingsRepository
      .createQueryBuilder('settings')
      .leftJoinAndSelect('settings.logo', 'logo')
      .select([
        'settings.appName',
        'settings.description',
        'settings.whatsappNumber1',
        'settings.whatsappNumber2',
        'settings.phone1',
        'settings.phone2',
        'settings.email',
        'settings.address',
        'settings.city',
        'settings.country',
        'settings.postalCode',
        'logo.id',
        'logo.path',
      ])
      .where('settings.isActive = :isActive', { isActive: true })
      .getOne();

    if (!settings) {
      throw new NotFoundException('No active settings found');
    }

    return settings;
  }
  /**
   * Get social media links for public use
   */
  async getPublicSocialLinks(): Promise<{
    facebookPageLink?: string;
    instagramLink?: string;
    tiktokLink?: string;
    twitterLink?: string;
    linkedinLink?: string;
    youtubeLink?: string;
    website?: string;
  }> {
    const settings = await this.settingsRepository.findOne({
      where: { isActive: true },
      select: [
        'facebookPageLink',
        'instagramLink',
        'tiktokLink',
        'twitterLink',
        'linkedinLink',
        'youtubeLink',
        'website',
      ],
    });

    if (!settings) {
      throw new NotFoundException('Settings not found or inactive.');
    }

    return settings;
  }

  /**
   * Get legal documents for public use
   */
  async getPublicLegalDocuments(): Promise<{
    aboutUs?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
    refundPolicy?: string;
    shippingPolicy?: string;
  }> {
    const settings = await this.settingsRepository
      .createQueryBuilder('settings')
      .select([
        'settings.aboutUs',
        'settings.termsAndConditions',
        'settings.privacyPolicy',
        'settings.refundPolicy',
        'settings.shippingPolicy',
      ])
      .where('settings.isActive = :isActive', { isActive: true })
      .getOne();

    if (!settings) {
      throw new NotFoundException('Settings not found or inactive.');
    }

    return settings;
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(settings: Settings): SettingsResponseDto {
    return {
      id: settings.id,
      appName: settings.appName,
      logo: settings.logo,
      description: settings.description,
      whatsappNumber1: settings.whatsappNumber1,
      whatsappNumber2: settings.whatsappNumber2,
      facebookPageLink: settings.facebookPageLink,
      instagramLink: settings.instagramLink,
      tiktokLink: settings.tiktokLink,
      phone1: settings.phone1,
      phone2: settings.phone2,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      postalCode: settings.postalCode,
      website: settings.website,
      twitterLink: settings.twitterLink,
      linkedinLink: settings.linkedinLink,
      youtubeLink: settings.youtubeLink,
      aboutUs: settings.aboutUs,
      termsAndConditions: settings.termsAndConditions,
      privacyPolicy: settings.privacyPolicy,
      refundPolicy: settings.refundPolicy,
      shippingPolicy: settings.shippingPolicy,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
