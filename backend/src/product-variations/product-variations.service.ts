import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { PrismaService } from '../prisma.service';
import { PaginationInput } from 'src/common/dto/pagination.input';

@Injectable()
export class ProductVariationsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductVariationInput: CreateProductVariationInput) {
    return this.prisma.product_variation.create({
      data: createProductVariationInput,
    });
  }

  async findAll(paginationInput?: PaginationInput) {
    const { page = 1, limit = 10, search = '' } = paginationInput || {};
    const skip = (page - 1) * limit;

    const where = search
      ? {
        OR: [
          { product_variation_name: { contains: search } },
        ],
      }
      : {};

    const [data, totalCount] = await Promise.all([
      this.prisma.product_variation.findMany({
        skip,
        take: limit,
        where,
        orderBy: { product_variation_id: 'desc' },
      }),
      this.prisma.product_variation.count({ where }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findByProductId(productId: number, paginationInput?: PaginationInput) {
    const { page = 1, limit = 10, search = '' } = paginationInput || {};
    const skip = (page - 1) * limit;

    const where = {
      product_id: productId,
      ...(search ? {
        product_variation_name: { contains: search }
      } : {})
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.product_variation.findMany({
        skip,
        take: limit,
        where,
        orderBy: { product_variation_id: 'desc' },
      }),
      this.prisma.product_variation.count({ where }),
    ]);

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: number) {
    const productVariation = await this.prisma.product_variation.findUnique({
      where: { product_variation_id: id },
    });

    if (!productVariation) {
      throw new NotFoundException(`Product variation with ID ${id} not found`);
    }

    return productVariation;
  }

  async update(id: number, updateProductVariationInput: UpdateProductVariationInput) {
    const { product_variation_id, ...data } = updateProductVariationInput;

    return this.prisma.product_variation.update({
      where: { product_variation_id: id },
      data,
    });
  }

  async remove(id: number) {
    const productVariation = await this.findOne(id);

    return this.prisma.product_variation.delete({
      where: { product_variation_id: id },
    });
  }
}
