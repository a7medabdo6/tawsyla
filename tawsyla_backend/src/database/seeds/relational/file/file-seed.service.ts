import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../../../files/infrastructure/persistence/relational/entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileSeedService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  async run() {
    const imagesPath = path.join(process.cwd(), 'files', 'images');

    // Check if images directory exists
    if (!fs.existsSync(imagesPath)) {
      console.log('Images directory not found, skipping file seeding');
      return;
    }

    // Get all image files from the directory
    const imageFiles = fs.readdirSync(imagesPath).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('No image files found in images directory');
      return;
    }

    console.log(`Found ${imageFiles.length} image files in directory`);

    // Get existing file paths from database
    const existingFiles = await this.repository.find();
    const existingPaths = new Set(existingFiles.map((file) => file.path));

    console.log(`Found ${existingFiles.length} existing files in database`);

    // Filter out files that already exist in database
    const newImageFiles = imageFiles.filter((filename) => {
      const filePath = `/images/${filename}`;
      return !existingPaths.has(filePath);
    });

    if (newImageFiles.length === 0) {
      console.log('All image files are already seeded');
      return;
    }

    console.log(`Adding ${newImageFiles.length} new image files to database`);

    // Create file entities for new images only
    const fileEntities = newImageFiles.map((filename) => {
      const filePath = `/images/${filename}`;
      return this.repository.create({
        path: filePath,
      });
    });

    // Save new files to database
    await this.repository.save(fileEntities);

    console.log(
      `Successfully added ${fileEntities.length} new image files to database`,
    );
  }
}
