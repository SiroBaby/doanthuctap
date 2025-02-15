import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDetailInput } from './dto/create-product-detail.input';
import { UpdateProductDetailInput } from './dto/update-product-detail.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductDetailService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDetailInput: CreateProductDetailInput) {
    try {
      const product_detail = await this.prisma.product_Detail.create({
        data: {
          ...createProductDetailInput,
          create_at: new Date(),
          update_at: new Date()
        },
      });
      console.log(product_detail.product_detail_id);
      return product_detail;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product detail already exists');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.product_Detail.findMany();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const productDetail = await this.prisma.product_Detail.findUnique({
        where: { product_detail_id: id },
      });
      if (!productDetail) {
        throw new NotFoundException(`Product detail with ID ${id} not found`);
      }
      return productDetail;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateProductDetailInput: UpdateProductDetailInput) {
    try {
      return await this.prisma.product_Detail.update({
        where: { product_detail_id: id },
        data: {
          ...updateProductDetailInput,
          update_at: new Date()
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product detail already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.product_Detail.delete({
        where: { product_detail_id: id },
      });
    } catch (error) {
      throw error;
    }
  }
}
