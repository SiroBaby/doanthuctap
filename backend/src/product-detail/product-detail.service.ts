import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDetailInput } from './dto/create-product-detail.input';
import { UpdateProductDetailInput } from './dto/update-product-detail.input';
import { PrismaService } from '../prisma.service';
import { PaginationInput } from '../common/dto/pagination.input';

@Injectable()
export class ProductDetailService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDetailInput: CreateProductDetailInput) {
    return this.prisma.product_Detail.create({
      data: createProductDetailInput,
    });
  }

  async findAll(paginationInput?: PaginationInput) {
    const { page = 1, limit = 10, search = '' } = paginationInput || {};
    const skip = (page - 1) * limit;

    const where = search
      ? {
        OR: [
          { description: { contains: search } },
          { specifications: { contains: search } },
        ],
      }
      : {};

    const [items, totalCount] = await Promise.all([
      this.prisma.product_Detail.findMany({
        skip,
        take: limit,
        where,
        orderBy: { product_detail_id: 'desc' },
      }),
      this.prisma.product_Detail.count({ where }),
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
    const productDetail = await this.prisma.product_Detail.findUnique({
      where: { product_detail_id: id },
    });

    if (!productDetail) {
      throw new NotFoundException(`Product detail with ID ${id} not found`);
    }

    return productDetail;
  }

  async update(id: number, updateProductDetailInput: UpdateProductDetailInput) {
    const { product_detail_id, ...data } = updateProductDetailInput;

    return this.prisma.product_Detail.update({
      where: { product_detail_id: id },
      data,
    });
  }

  async remove(id: number) {
    const productDetail = await this.findOne(id);

    return this.prisma.product_Detail.delete({
      where: { product_detail_id: id },
    });
  }
}
