import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';

@Module({
  providers: [CategoryResolver, CategoryService],
})
export class CategoryModule {}
