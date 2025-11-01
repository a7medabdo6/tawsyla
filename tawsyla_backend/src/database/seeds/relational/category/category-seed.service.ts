import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../../category/entities/category.entity';
import simplifiedData from '../../../../../all-products';

interface CategoryData {
  level1: string;
  level2: string;
  level3: string;
  fullPath: string;
  levels: number;
}

@Injectable()
export class CategorySeedService {
  constructor(
    @InjectRepository(Category)
    private repository: Repository<Category>,
  ) {}

  async run() {
    console.log('Starting category seeding...');

    // Extract unique categories from products data
    const categoryMap = new Map<string, CategoryData>();

    simplifiedData.forEach((product) => {
      const category = product.category;
      const key = `${category.level1}|${category.level2}|${category.level3}`;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, category);
      }
    });

    console.log(`Found ${categoryMap.size} unique categories to process`);

    // Check if categories are already seeded
    const existingCategoriesCount = await this.repository.count();
    if (existingCategoriesCount > 0) {
      console.log(
        `Categories already exist (${existingCategoriesCount} categories found). Skipping category seeding to avoid duplicates.`,
      );
      console.log(
        'If you want to add new categories, please clear the categories table first or modify the seed service.',
      );
      return;
    }

    // Create category hierarchy
    const categories = await this.createCategoryHierarchy(categoryMap);

    console.log(`Successfully seeded ${categories.length} categories`);
  }

  async runWithMerge() {
    console.log('Starting category seeding with merge...');

    // Extract unique categories from products data
    const categoryMap = new Map<string, CategoryData>();

    simplifiedData.forEach((product) => {
      const category = product.category;
      const key = `${category.level1}|${category.level2}|${category.level3}`;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, category);
      }
    });

    console.log(`Found ${categoryMap.size} unique categories to process`);

    // Get existing categories
    const existingCategories = await this.repository.find();
    const existingCategoryNames = new Set(
      existingCategories.map((cat) => cat.nameAr),
    );

    console.log(`Found ${existingCategories.length} existing categories`);

    // Filter out categories that already exist
    const newCategories = new Map<string, CategoryData>();
    categoryMap.forEach((categoryData, key) => {
      const categoryName =
        categoryData.level1 || categoryData.level2 || categoryData.level3;
      if (!existingCategoryNames.has(categoryName)) {
        newCategories.set(key, categoryData);
      }
    });

    if (newCategories.size === 0) {
      console.log('All categories already exist in database');
      return;
    }

    console.log(`Adding ${newCategories.size} new categories`);

    // Create category hierarchy for new categories only
    const categories = await this.createCategoryHierarchy(newCategories);

    console.log(`Successfully added ${categories.length} new categories`);
  }

  private async createCategoryHierarchy(
    categoryMap: Map<string, CategoryData>,
  ): Promise<Category[]> {
    const createdCategories = new Map<string, Category>();
    const categoriesToCreate: Category[] = [];

    // First pass: create all level 1 categories
    const level1Categories = new Set<string>();
    categoryMap.forEach((categoryData) => {
      if (categoryData.level1) {
        level1Categories.add(categoryData.level1);
      }
    });

    level1Categories.forEach((level1Name) => {
      const category = this.repository.create({
        nameEn: level1Name, // Using Arabic name as both En and Ar for now
        nameAr: level1Name,
        fullPath: level1Name,
        descriptionEn: `Category: ${level1Name}`,
        descriptionAr: `فئة: ${level1Name}`,
      });
      categoriesToCreate.push(category);
      createdCategories.set(level1Name, category);
    });

    // Second pass: create level 2 categories
    const level2Categories = new Map<string, string>(); // level2Name -> level1Name
    categoryMap.forEach((categoryData) => {
      if (categoryData.level2 && categoryData.level1) {
        const key = `${categoryData.level1}|${categoryData.level2}`;
        level2Categories.set(key, categoryData.level1);
      }
    });

    level2Categories.forEach((level1Name, key) => {
      const level2Name = key.split('|')[1];
      const parentCategory = createdCategories.get(level1Name);

      if (parentCategory) {
        const category = this.repository.create({
          nameEn: level2Name,
          nameAr: level2Name,
          fullPath: `${level1Name} > ${level2Name}`,
          descriptionEn: `Subcategory: ${level2Name}`,
          descriptionAr: `فئة فرعية: ${level2Name}`,
        });
        categoriesToCreate.push(category);
        createdCategories.set(key, category);
      }
    });

    // Third pass: create level 3 categories
    const level3Categories = new Map<string, string>(); // level3Name -> level1|level2
    categoryMap.forEach((categoryData) => {
      if (categoryData.level3 && categoryData.level2 && categoryData.level1) {
        const key = `${categoryData.level1}|${categoryData.level2}|${categoryData.level3}`;
        const parentKey = `${categoryData.level1}|${categoryData.level2}`;
        level3Categories.set(key, parentKey);
      }
    });

    level3Categories.forEach((parentKey, key) => {
      const level3Name = key.split('|')[2];
      const parentCategory = createdCategories.get(parentKey);

      if (parentCategory) {
        const parts = key.split('|');
        const category = this.repository.create({
          nameEn: level3Name,
          nameAr: level3Name,
          fullPath: `${parts[0]} > ${parts[1]} > ${level3Name}`,
          descriptionEn: `Sub-subcategory: ${level3Name}`,
          descriptionAr: `فئة فرعية فرعية: ${level3Name}`,
        });
        categoriesToCreate.push(category);
        createdCategories.set(key, category);
      }
    });

    // Save all categories to database
    const savedCategories = await this.repository.save(categoriesToCreate);

    // Update parent references with actual IDs
    const updatedCategories: Category[] = [];

    if (updatedCategories.length > 0) {
      await this.repository.save(updatedCategories);
    }

    return savedCategories;
  }
}
