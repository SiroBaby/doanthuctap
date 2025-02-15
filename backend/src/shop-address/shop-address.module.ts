import { Module } from '@nestjs/common';
import { ShopAddressService } from './shop-address.service';
import { ShopAddressResolver } from './shop-address.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ShopAddressResolver, ShopAddressService, PrismaService],
})
export class ShopAddressModule {}
