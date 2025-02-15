import { Injectable } from '@nestjs/common';
import { CreateShopAddressInput } from './dto/create-shop-address.input';
import { UpdateShopAddressInput } from './dto/update-shop-address.input';
import { PrismaService } from 'src/prisma.service';
import { abort } from 'process';

@Injectable()
export class ShopAddressService {
  constructor(private prisma: PrismaService) { }

  async create(createShopAddressInput: CreateShopAddressInput) {
    try {
      return await this.prisma.shop_address.create({
        data: createShopAddressInput,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return await this.prisma.shop_address.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.shop_address.findUnique({
      where: {
        address_id: id,
      }
    });
  }

  async update(id: number, updateShopAddressInput: UpdateShopAddressInput) {
    return await this.prisma.shop_address.update({
      where: { address_id: id },
      data: updateShopAddressInput,
    });
  }

  async remove(id: number) {
    return await this.prisma.shop_address.delete({
      where: { address_id: id }
    })
  }
}
