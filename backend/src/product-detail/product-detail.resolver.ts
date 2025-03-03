import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductDetailService } from './product-detail.service';
import { ProductDetail } from './entities/product-detail.entity';
import { CreateProductDetailInput } from './dto/create-product-detail.input';
import { UpdateProductDetailInput } from './dto/update-product-detail.input';
import { PaginatedProductDetails } from './entities/paginated-product-details.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';

@Resolver(() => ProductDetail)
export class ProductDetailResolver {
  constructor(private readonly productDetailService: ProductDetailService) { }

  @Mutation(() => ProductDetail)
  createProductDetail(@Args('createProductDetailInput') createProductDetailInput: CreateProductDetailInput) {
    return this.productDetailService.create(createProductDetailInput);
  }

  @Query(() => PaginatedProductDetails, { name: 'productDetails' })
  findAll(@Args('pagination', { nullable: true }) pagination?: PaginationInput) {
    return this.productDetailService.findAll(pagination);
  }

  @Query(() => ProductDetail, { name: 'productDetail' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productDetailService.findOne(id);
  }

  @Mutation(() => ProductDetail)
  updateProductDetail(@Args('updateProductDetailInput') updateProductDetailInput: UpdateProductDetailInput) {
    return this.productDetailService.update(updateProductDetailInput.product_detail_id, updateProductDetailInput);
  }

  @Mutation(() => ProductDetail)
  removeProductDetail(@Args('id', { type: () => Int }) id: number) {
    return this.productDetailService.remove(id);
  }
}
