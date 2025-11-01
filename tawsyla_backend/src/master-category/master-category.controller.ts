import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MasterCategoryService } from './master-category.service';
import { CreateMasterCategoryDto } from './dto/create-master-category.dto';
import { UpdateMasterCategoryDto } from './dto/update-master-category.dto';
import { MasterCategoryResponseDto } from './dto/master-category-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';

@ApiTags('Master Categories')
@Controller('master-categories')
export class MasterCategoryController {
  constructor(private readonly masterCategoryService: MasterCategoryService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new master category' })
  @ApiResponse({
    status: 201,
    description: 'Master category created successfully',
    type: MasterCategoryResponseDto,
  })
  create(@Body() createMasterCategoryDto: CreateMasterCategoryDto) {
    return this.masterCategoryService.create(createMasterCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all master categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all master categories',
    type: [MasterCategoryResponseDto],
  })
  findAll() {
    return this.masterCategoryService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a master category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the master category',
    type: MasterCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Master category not found' })
  findOne(@Param('id') id: string) {
    return this.masterCategoryService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a master category' })
  @ApiResponse({
    status: 200,
    description: 'Master category updated successfully',
    type: MasterCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Master category not found' })
  update(
    @Param('id') id: string,
    @Body() updateMasterCategoryDto: UpdateMasterCategoryDto,
  ) {
    return this.masterCategoryService.update(id, updateMasterCategoryDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a master category' })
  @ApiResponse({
    status: 200,
    description: 'Master category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Master category not found' })
  remove(@Param('id') id: string) {
    return this.masterCategoryService.remove(id);
  }

  @Post(':id/image')
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image for a master category' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 404, description: 'Master category not found' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    // Implementation would go here
    // You would typically save the file and update the master category with the file ID
    return { message: 'Image upload endpoint' };
  }
}
