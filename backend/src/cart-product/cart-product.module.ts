import { Module } from '@nestjs/common';
import { CartProductService } from './cart-product.service';
import { CartProductResolver } from './cart-product.resolver';
import { PrismaService } from '../prisma.service';
@Module({
  providers: [CartProductResolver, CartProductService, PrismaService],
})
export class CartProductModule { }
