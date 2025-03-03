import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariation } from './entities/product-variation.entity';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { PaginatedProductVariations } from './entities/paginated-product-variations.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';

@Resolver(() => ProductVariation)
export class ProductVariationsResolver {
  constructor(private readonly productVariationsService: ProductVariationsService) { }

  @Mutation(() => ProductVariation)
  createProductVariation(@Args('createProductVariationInput') createProductVariationInput: CreateProductVariationInput) {
    return this.productVariationsService.create(createProductVariationInput);
  }

  @Query(() => PaginatedProductVariations, { name: 'productVariations' })
  findAll(@Args('pagination', { nullable: true }) pagination?: PaginationInput) {
    return this.productVariationsService.findAll(pagination);
  }

  @Query(() => PaginatedProductVariations, { name: 'productVariationsByProductId' })
  findByProductId(
    @Args('productId', { type: () => Int }) productId: number,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ) {
    return this.productVariationsService.findByProductId(productId, pagination);
  }

  @Query(() => ProductVariation, { name: 'productVariation' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productVariationsService.findOne(id);
  }

  @Mutation(() => ProductVariation)
  updateProductVariation(@Args('updateProductVariationInput') updateProductVariationInput: UpdateProductVariationInput) {
    return this.productVariationsService.update(updateProductVariationInput.product_variation_id, updateProductVariationInput);
  }

  @Mutation(() => ProductVariation)
  removeProductVariation(@Args('id', { type: () => Int }) id: number) {
    return this.productVariationsService.remove(id);
  }
}
