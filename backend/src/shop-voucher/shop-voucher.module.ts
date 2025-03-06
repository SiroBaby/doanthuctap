import { Module } from '@nestjs/common';
import { ShopVoucherService } from './shop-voucher.service';
import { ShopVoucherResolver } from './shop-voucher.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ShopVoucherResolver, ShopVoucherService, PrismaService],
})
export class ShopVoucherModule {}
