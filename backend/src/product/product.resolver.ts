import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PaginationInput } from '../common/dto/pagination.input';
import ProductPagination from './entities/productpagination.entity';
import ShopPagination from '../shop/entities/shoppagination.entity';
import { CreateProduct } from './entities/createproduct.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => CreateProduct)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productService.create(createProductInput);
  }

  @Query(() => ProductPagination, { name: 'products' })
  findAll(
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ) {
    return this.productService.findAll(pagination);
  }

  @Query(() => ProductPagination, { name: 'getProductsByShopId' })
  getProductsByShopId(
    @Args('id', { type: () => String }) id: string,
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ) {
    return this.productService.getProductsByShopId(id, pagination);
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Mutation(() => Product)
  updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productService.update(
      updateProductInput.product_id,
      updateProductInput,
    );
  }

  @Mutation(() => Product)
  removeProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productService.remove(id);
  }
}
