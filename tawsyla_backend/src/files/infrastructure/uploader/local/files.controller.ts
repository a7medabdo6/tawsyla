import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
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
  downloadStatics(@Param('path') path, @Response() response) {
    console.log(path, 'pathhhh');
    const filePath = join(process.cwd(), 'files', 'images', path);
    console.log('Serving file from:', filePath);
    return response.sendFile(filePath);
  }
  
  @Get(':path')
  @ApiExcludeEndpoint()
  download(@Param('path') path, @Response() response) {
    const filePath = join(process.cwd(), 'files', 'images', path);
    console.log('Serving file from:', filePath);
    return response.sendFile(filePath);
  }
}
