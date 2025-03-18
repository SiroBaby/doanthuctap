import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from '../prisma.service';
import { PaginationInput } from '../common/dto/pagination.input';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

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
    const { page = 1, limit = 10, search } = paginationArgs;

    const wherecondition = search
      ? {
          OR: [
            { product_name: { contains: search } },
            {
              product_id: isNaN(parseInt(search))
                ? undefined
                : parseInt(search),
            },
          ],
        }
      : {};

    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          skip,
          where: wherecondition,
          take: limit,
          orderBy: { product_id: 'desc' },
          include: {
            shop: true,
            product_detail: true,
            product_images: true,
            product_variations: true,
            category: {
              select: {
                category_name: true,
              },
            },
          },
        }),
        this.prisma.product.count(),
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

  async getProductsByShopId(
    shopId: string,
    paginationArgs: PaginationInput = { page: 1, limit: 10, search: '' },
  ) {
    const { page = 1, limit = 10, search } = paginationArgs;

    const whereCondition = {
      shop_id: shopId,
      ...(search
        ? {
            OR: [
              { product_name: { contains: search } },
              {
                product_id: isNaN(parseInt(search))
                  ? undefined
                  : parseInt(search),
              },
            ],
          }
        : {}),
    };

    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy: { product_id: 'desc' },
          include: {
            shop: true,
            product_detail: true,
            product_images: true,
            product_variations: true,
            category: {
              select: {
                category_name: true,
              },
            },
          },
        }),
        this.prisma.product.count({ where: whereCondition }),
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
        include: {
          shop: true,
          product_detail: true,
          product_images: true,
          product_variations: true,
          category: {
            select: {
              category_name: true,
            },
          },
        },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      // Convert slug format back to potential product name variations
      const searchName = slug.replace(/-/g, ' ');
      
      // Find product with matching product_name (we use simple contains without case sensitivity)
      const product = await this.prisma.product.findFirst({
        where: {
          product_name: {
            contains: searchName,
          },
          status: 'active',
        },
        include: {
          shop: {
            include: {
              user: {
                select: {
                  user_name: true,
                  avatar: true,
                },
              },
            },
          },
          product_detail: true,
          product_images: true,
          product_variations: {
            where: {
              status: 'active',
            },
          },
          category: {
            select: {
              category_name: true,
            },
          },
        },
      });
      
      if (!product) {
        throw new NotFoundException(`Product with slug ${slug} not found`);
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateProductInput: UpdateProductInput,
    shopid: string,
  ) {
    try {
      const { product_id, ...updateData } = updateProductInput;
      const product = await this.findOne(id);

      if (product.shop_id !== shopid) {
        throw new ConflictException(
          'Không tìm thấy sản phẩm này trong shop của bạn',
        );
      }

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
      }

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
