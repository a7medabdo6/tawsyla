import { PartialType } from '@nestjs/swagger';
import { CreateBanneryDto } from './create-banner.dto';

export class UpdateBannerDto extends PartialType(CreateBanneryDto) {}
