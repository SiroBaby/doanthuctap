import { Injectable } from '@nestjs/common';
import { CreateShopInput } from './dto/create-shop.input';
import { UpdateShopInput } from './dto/update-shop.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) { }

  create(createShopInput: CreateShopInput) {
    return this.prisma.shop.create({
      data: {
        shop_id: createShopInput.shop_id,
        shop_name: createShopInput.shop_name,
        logo: createShopInput.logo,
        status: createShopInput.status,
        location_id: createShopInput.location_id,
        id_user: createShopInput.id_user,
        create_at: createShopInput.create_at || new Date(),
      }
    });
  }

  async findAll(paginationArgs: PaginationInput) {
    const { page = 1, limit = 10, search } = paginationArgs;

    const wherecondition = search
      ? {
        OR: [
          { shop_id: { contains: search } },
          { shop_name: { contains: search } },
        ],
      }
      : {};

    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.shop.findMany({
          skip,
          where: wherecondition,
          take: limit,
          orderBy: { shop_id: 'desc' },
        }),
        this.prisma.shop.count(),
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

  async findOne(id: string) {
    try {
      const [data] = await Promise.all([
        this.prisma.shop.findUnique({
          where: { shop_id: id },
          include: {
            shop_addresses: true,
            user: true,
            location: true,
            products: {
              include: {
                product_images: true,
              },
              orderBy: {
                create_at: 'desc',
              },
            },
            shop_vouchers: true,
          },
        }),
      ]);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getShopIdByUserId(id: string) {
    try {
      const [data] = await Promise.all([
        this.prisma.shop.findFirst({
          where: { id_user: id },
        }),
      ]);
      return data;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateShopInput: UpdateShopInput) {
    return `This action updates a #${id} shop`;
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
}
