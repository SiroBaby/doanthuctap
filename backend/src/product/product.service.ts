import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from '../prisma.service';
import { PaginationInput } from '../common/dto/pagination.input';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) { }

  async create(createProductInput: CreateProductInput) {
    try {
      return await this.prisma.product.create({
        data: {
          ...createProductInput,
          create_at: new Date(),
          update_at: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product already exists');
      }
      throw error;
    }
  }

  async findAll(paginationArgs: PaginationInput) {
    const { page = 1, limit = 10 } = paginationArgs;
    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          skip,
          take: limit,
        }),
        this.prisma.product.count()
      ]);
      return {
        data,
        totalCount,
        totalPage: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { product_id: id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateProductInput: UpdateProductInput) {
    try {
      const { product_id, ...updateData } = updateProductInput;
      await this.findOne(id);

      return await this.prisma.product.update({
        where: { product_id: id },
        data: {
          ...updateData,
          update_at: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id); // Check if exists
      return await this.prisma.product.delete({
        where: { product_id: id },
      });
    } catch (error) {
      throw error;
    }
  }
}
