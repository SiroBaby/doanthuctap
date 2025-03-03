import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageResolver } from './product-image.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ProductImageResolver, ProductImageService, PrismaService],
})
export class ProductImageModule { }
