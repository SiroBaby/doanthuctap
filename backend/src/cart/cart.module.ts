import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [CartResolver, CartService, PrismaService],
})
export class CartModule {}
