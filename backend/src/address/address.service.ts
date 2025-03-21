import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { PrismaService } from 'src/prisma.service';
import { PaginationInput } from '../common/dto/pagination.input';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) { }

  create(createAddressInput: CreateAddressInput) {
    return this.prisma.address.create({
      data: createAddressInput,
    });
  }

  async addressByUserId(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: {
        id_user: userId,
      },
    });

    // Trả về đối tượng đầy đủ theo cấu trúc AddressByUserId
    return {
      address: addresses,
    };
  }

  async findAll({ page, limit }: PaginationInput) {
    try {
      const skip = (page - 1) * limit;
      const [data, totalCount] = await Promise.all([
        this.prisma.address.findMany({
          skip,
          take: limit,
        }),
        this.prisma.address.count()
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
    return await this.prisma.address.findUnique({
      where: {
        address_id: id,
      },
    });
  }

  update(id: number, updateAddressInput: UpdateAddressInput) {
    return this.prisma.address.update({
      where: { address_id: id },
      data: updateAddressInput,
    });
  }

  remove(id: number) {
    return this.prisma.address.delete({
      where: { address_id: id },
    });
  }
}
