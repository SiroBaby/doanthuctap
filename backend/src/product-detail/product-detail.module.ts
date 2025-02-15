import { Module } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';
import { ProductDetailResolver } from './product-detail.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ProductDetailResolver, ProductDetailService, PrismaService],
})
export class ProductDetailModule {}
