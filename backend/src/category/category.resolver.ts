import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { PaginationArgs } from '../common/dto/pagination.args';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) { }

  @Mutation(() => Category)
  createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput) {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => [Category], { name: 'categorys' })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.categoryService.findAll(paginationArgs);
  }

  @Query(() => Category, { name: 'category' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category)
  updateCategory(@Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput) {
    return this.categoryService.update(updateCategoryInput.category_id, updateCategoryInput);
  }

  @Mutation(() => Category)
  removeCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }
}
