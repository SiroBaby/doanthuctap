import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { PrismaService } from 'src/prisma.service';
import * as moment from 'moment-timezone';
import { PaginationInput } from '../common/dto/pagination.input';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

  async create(createCategoryInput: CreateCategoryInput) {
    try {
      const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').toDate();
      return await this.prisma.category.create({
        data: {
          ...createCategoryInput,
          create_at: vietnamTime,
          update_at: vietnamTime
        },
      });
    } catch (error) {
      throw new Error('Category already exists');
    }
  }

  async findAll({ page, limit }: PaginationInput) {
    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.category.findMany({
          skip,
          take: limit,
        }),
        this.prisma.category.count()
      ]);

      return {
        data,
        totalCount,
        totalPage: Math.ceil(totalCount / limit),
      };

    } catch (error) {
      throw new NotFoundException('Categories not found');
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          category_id: id,
        },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      throw new NotFoundException('Error finding category');
    }
  }

  async update(id: number, updateCategoryInput: UpdateCategoryInput) {
    try {
      const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').toDate();
      return await this.prisma.category.update({
        where: { category_id: id },
        data: {
          ...updateCategoryInput,
          update_at: vietnamTime
        },
      });
    } catch (error) {
      throw new NotFoundException('Error updating category. Category not found');
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.category.delete({
        where: { category_id: id },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      throw new NotFoundException('Error deleting category. Category not found');
    }
  }
}
