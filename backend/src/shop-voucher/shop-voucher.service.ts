import { Injectable } from '@nestjs/common';
import { CreateShopVoucherInput } from './dto/create-shop-voucher.input';
import { UpdateShopVoucherInput } from './dto/update-shop-voucher.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShopVoucherService {
  constructor(private prisma: PrismaService) {}
  create(createShopVoucherInput: CreateShopVoucherInput) {
    return 'This action adds a new shopVoucher';
  }

  findAll() {
    return this.prisma.shop_Voucher.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} shopVoucher`;
  }

  update(id: number, updateShopVoucherInput: UpdateShopVoucherInput) {
    return `This action updates a #${id} shopVoucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopVoucher`;
  }
}
