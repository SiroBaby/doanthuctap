import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [CategoryResolver, CategoryService, PrismaService],
})
export class CategoryModule { }
