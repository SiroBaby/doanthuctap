import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopResolver } from './shop.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ShopResolver, ShopService, PrismaService],
})
export class ShopModule {}
