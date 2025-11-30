import { Injectable } from '@nestjs/common';
import { CreateShopAddressInput } from './dto/create-shop-address.input';
import { UpdateShopAddressInput } from './dto/update-shop-address.input';
import { PrismaService } from '../prisma.service';
import { abort } from 'process';

@Injectable()
export class ShopAddressService {
  constructor(private prisma: PrismaService) { }

  async create(createShopAddressInput: CreateShopAddressInput) {
    try {
      // Nếu là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác của shop này thành không phải mặc định
      if (createShopAddressInput.is_default) {
        await this.prisma.shop_address.updateMany({
          where: {
            shop_id: createShopAddressInput.shop_id,
            is_default: true,
          },
          data: {
            is_default: false,
          },
        });
      }

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
    try {
      // Nếu cập nhật thành địa chỉ mặc định, cập nhật tất cả các địa chỉ khác của shop này thành không phải mặc định
      if (updateShopAddressInput.is_default) {
        await this.prisma.shop_address.updateMany({
          where: {
            shop_id: updateShopAddressInput.shop_id,
            address_id: { not: id },
            is_default: true,
          },
          data: {
            is_default: false,
          },
        });
      }

      return await this.prisma.shop_address.update({
        where: { address_id: id },
        data: updateShopAddressInput,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Kiểm tra xem địa chỉ có phải mặc định không
      const address = await this.prisma.shop_address.findUnique({
        where: { address_id: id }
      });

      if (address && address.is_default) {
        throw new Error('Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ mặc định khác trước khi xóa.');
      }

      return await this.prisma.shop_address.delete({
        where: { address_id: id }
      });
    } catch (error) {
      throw error;
    }
  }

  async setDefault(id: number) {
    try {
      // Lấy thông tin địa chỉ
      const address = await this.prisma.shop_address.findUnique({
        where: { address_id: id }
      });

      if (!address) {
        throw new Error('Không tìm thấy địa chỉ');
      }

      // Cập nhật tất cả các địa chỉ của shop này thành không phải mặc định
      await this.prisma.shop_address.updateMany({
        where: {
          shop_id: address.shop_id,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });

      // Cập nhật địa chỉ này thành mặc định
      return await this.prisma.shop_address.update({
        where: { address_id: id },
        data: { is_default: true },
      });
    } catch (error) {
      throw error;
    }
  }
}
