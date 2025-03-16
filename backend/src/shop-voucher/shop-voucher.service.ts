import { Injectable } from '@nestjs/common';
import { CreateShopVoucherInput } from './dto/create-shop-voucher.input';
import { UpdateShopVoucherInput } from './dto/update-shop-voucher.input';
import { PrismaService } from '../prisma.service';
import { PaginationInput } from '../common/dto/pagination.input';
import { UpdateVoucherInput } from '../voucher/dto/update-voucher.input';
import { CreateVoucherInput } from '../voucher/dto/create-voucher.input';

@Injectable()
export class ShopVoucherService {
  constructor(private prisma: PrismaService) {}

  async create(createShopVoucherInput: CreateShopVoucherInput) {
    try {
      return await this.prisma.shop_Voucher.create({
        data: {
          ...createShopVoucherInput,
          create_at: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationArgs: PaginationInput) {
    const { page = 1, limit = 10, search } = paginationArgs;

    const wherecondition = search
      ? {
          OR: [
            { code: { contains: search } },
            { id: isNaN(parseInt(search)) ? undefined : parseInt(search) },
          ],
        }
      : {};

    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.shop_Voucher.findMany({
          skip,
          where: wherecondition,
          take: limit,
          orderBy: { create_at: 'desc' },
        }),
        this.prisma.shop_Voucher.count(),
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

  async findByShopId(shopId: string, paginationArgs: PaginationInput) {
    const { page = 1, limit = 10, search } = paginationArgs;

    const whereCondition = {
      shop_id: shopId,
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { id: isNaN(parseInt(search)) ? undefined : parseInt(search) },
            ],
          }
        : {}),
    };

    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.shop_Voucher.findMany({
          skip,
          where: whereCondition,
          take: limit,
          orderBy: { create_at: 'desc' },
          include: {
            shop: true,
          },
        }),
        this.prisma.shop_Voucher.count({
          where: whereCondition,
        }),
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
      return await this.prisma.shop_Voucher.findUnique({
        where: { id: id },
        include: {
          shop: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateShopVoucherInput: UpdateShopVoucherInput) {
    try {
      return await this.prisma.shop_Voucher.update({
        where: { id: id },
        data: {
          ...updateShopVoucherInput,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.shop_Voucher.update({
        where: { id: id },
        data: {
          delete_at: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
