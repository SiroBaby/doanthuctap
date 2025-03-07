import { Injectable } from '@nestjs/common';
import { CreateVoucherInput } from './dto/create-voucher.input';
import { UpdateVoucherInput } from './dto/update-voucher.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  async create(createVoucherInput: CreateVoucherInput) {
    try {
      return await this.prisma.voucher.create({
        data: {
          ...createVoucherInput,
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
        this.prisma.voucher.findMany({
          skip,
          where: wherecondition,
          take: limit,
          orderBy: { create_at: 'desc' },
        }),
        this.prisma.voucher.count(),
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
      return await this.prisma.voucher.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateVoucherInput: UpdateVoucherInput) {
    try {
      return await this.prisma.voucher.update({
        where: { id: id },
        data: {
          ...updateVoucherInput,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.voucher.update({
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
