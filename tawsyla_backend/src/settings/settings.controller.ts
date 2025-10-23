import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@ApiTags('Settings')
@Controller({
  path: 'settings',
  version: '1',
})
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create app settings (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Settings created successfully',
    type: SettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Settings already exist',
  })
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({
    groups: ['admin'],
  })
  create(
    @Body() createSettingsDto: CreateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.create(createSettingsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current app settings (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: SettingsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found',
  })
  @HttpCode(HttpStatus.OK)
  findOne(): Promise<SettingsResponseDto> {
    return this.settingsService.findOne();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public app settings (Active only)' })
  @ApiResponse({
    status: 200,
    description: 'Public settings retrieved successfully',
    type: SettingsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found or inactive',
  })
  @HttpCode(HttpStatus.OK)
  getPublicSettings(): Promise<SettingsResponseDto> {
    return this.settingsService.getPublicSettings();
  }

  @Get('contact-info')
  @ApiOperation({ summary: 'Get public contact information' })
  @ApiResponse({
    status: 200,
    description: 'Contact information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        appName: { type: 'string', example: 'Tawsyla' },
        logo: { type: 'string', example: 'https://example.com/logo.png' },
        description: {
          type: 'string',
          example: 'Your trusted e-commerce platform',
        },
        whatsappNumber1: { type: 'string', example: '+1234567890' },
        whatsappNumber2: { type: 'string', example: '+0987654321' },
        phone1: { type: 'string', example: '+1234567890' },
        phone2: { type: 'string', example: '+0987654321' },
        email: { type: 'string', example: 'contact@tawsyla.com' },
        address: { type: 'string', example: '123 Main Street, City, Country' },
        city: { type: 'string', example: 'New York' },
        country: { type: 'string', example: 'United States' },
        postalCode: { type: 'string', example: '10001' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  getContactInfo() {
    return this.settingsService.getPublicContactInfo();
  }

  @Get('social-links')
  @ApiOperation({ summary: 'Get public social media links' })
  @ApiResponse({
    status: 200,
    description: 'Social media links retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        facebookPageLink: {
          type: 'string',
          example: 'https://facebook.com/tawsyla',
        },
        instagramLink: {
          type: 'string',
          example: 'https://instagram.com/tawsyla',
        },
        tiktokLink: { type: 'string', example: 'https://tiktok.com/@tawsyla' },
        twitterLink: { type: 'string', example: 'https://twitter.com/tawsyla' },
        linkedinLink: {
          type: 'string',
          example: 'https://linkedin.com/company/tawsyla',
        },
        youtubeLink: {
          type: 'string',
          example: 'https://youtube.com/c/tawsyla',
        },
        website: { type: 'string', example: 'https://tawsyla.com' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  getSocialLinks() {
    return this.settingsService.getPublicSocialLinks();
  }

  @Get('legal-documents')
  @ApiOperation({ summary: 'Get public legal documents' })
  @ApiResponse({
    status: 200,
    description: 'Legal documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        aboutUs: {
          type: 'string',
          example: 'We are a leading e-commerce platform...',
        },
        termsAndConditions: {
          type: 'string',
          example: 'By using our service, you agree to...',
        },
        privacyPolicy: {
          type: 'string',
          example: 'We respect your privacy and...',
        },
        refundPolicy: {
          type: 'string',
          example: 'We offer 30-day refund policy...',
        },
        shippingPolicy: {
          type: 'string',
          example: 'We ship worldwide with...',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  getLegalDocuments() {
    return this.settingsService.getPublicLegalDocuments();
  }

  @Patch()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update app settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: SettingsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found',
  })
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({
    groups: ['admin'],
  })
  update(
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.update(updateSettingsDto);
  }

  @Patch('toggle-active')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Toggle settings active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings status toggled successfully',
    type: SettingsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found',
  })
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({
    groups: ['admin'],
  })
  toggleActiveStatus(): Promise<SettingsResponseDto> {
    return this.settingsService.toggleActiveStatus();
  }

  @Delete()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Delete app settings (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Settings deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(): Promise<void> {
    return this.settingsService.remove();
  }

  @Post('upload-logo')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload logo file (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Logo uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logo uploaded successfully' },
        file: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-here' },
            path: { type: 'string', example: 'uploads/logo.png' },
            url: {
              type: 'string',
              example: 'https://example.com/uploads/logo.png',
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Here you would typically save the file and return the file info
    // This is a simplified example - you might want to use your file service
    const fileInfo = {
      id: 'generated-uuid-here', // Generate actual UUID
      path: file.path,
      url: `https://your-domain.com/${file.path}`,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    return {
      success: true,
      message: 'Logo uploaded successfully',
      file: fileInfo,
    };
  }
}
