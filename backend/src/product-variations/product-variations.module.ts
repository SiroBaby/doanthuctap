import { Module } from '@nestjs/common';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariationsResolver } from './product-variations.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ProductVariationsResolver, ProductVariationsService, PrismaService],
})
export class ProductVariationsModule { }
