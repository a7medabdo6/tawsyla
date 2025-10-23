import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { FilesLocalService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { join } from 'path';
import { existsSync } from 'fs';
import { Response as ExpressResponse } from 'express';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  @Post('upload')
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.filesService.create(file);
  }

  @Get('images/:path')
  @ApiExcludeEndpoint()
  downloadStatics(
    @Param('path') path: string,
    @Response() response: ExpressResponse,
  ) {
    console.log('Requested path:', path);
    const filePath = join(process.cwd(), 'files', 'images', path);
    console.log('Serving file from:', filePath);
    
    if (!existsSync(filePath)) {
      console.error('File not found:', filePath);
      throw new NotFoundException('File not found');
    }

    // Set proper content type based on file extension
    const ext = path.toLowerCase().split('.').pop() || '';
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    response.setHeader('Content-Type', contentType);
    
    return response.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!response.headersSent) {
          response.status(404).send('File not found');
        }
      }
    });
  }
  
  @Get(':path')
  @ApiExcludeEndpoint()
  download(
    @Param('path') path: string,
    @Response() response: ExpressResponse,
  ) {
    console.log('Requested path:', path);
    const filePath = join(process.cwd(), 'files', 'images', path);
    console.log('Serving file from:', filePath);
    
    if (!existsSync(filePath)) {
      console.error('File not found:', filePath);
      throw new NotFoundException('File not found');
    }

    // Set proper content type based on file extension
    const ext = path.toLowerCase().split('.').pop() || '';
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    response.setHeader('Content-Type', contentType);
    
    return response.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!response.headersSent) {
          response.status(404).send('File not found');
        }
      }
    });
  }
}
