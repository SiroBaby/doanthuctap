import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductImageService } from './product-image.service';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductImageInput } from './dto/create-product-image.input';
import { UpdateProductImageInput } from './dto/update-product-image.input';
import { PaginationInput } from '../common/dto/pagination.input';
PaginationInput

@Resolver(() => ProductImage)
export class ProductImageResolver {
  constructor(private readonly productImageService: ProductImageService) { }

  @Mutation(() => ProductImage)
  createProductImage(@Args('createProductImageInput') createProductImageInput: CreateProductImageInput) {
    return this.productImageService.create(createProductImageInput);
  }

  @Query(() => [ProductImage], { name: 'productImages' })
  findAll() {
    return this.productImageService.findAll();
  }

  @Query(() => ProductImage, { name: 'productImage' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productImageService.findOne(id);
  }

  @Query(() => [ProductImage], { name: 'productImagesByProductId' })
  findByProductId(@Args('productId', { type: () => Int }) productId: number) {
    return this.productImageService.findByProductId(productId);
  }

  @Mutation(() => ProductImage)
  updateProductImage(@Args('updateProductImageInput') updateProductImageInput: UpdateProductImageInput) {
    return this.productImageService.update(updateProductImageInput.image_id, updateProductImageInput);
  }

  @Mutation(() => ProductImage)
  removeProductImage(@Args('id', { type: () => Int }) id: number) {
    return this.productImageService.remove(id);
  }
}
