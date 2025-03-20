import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PaginationInput } from '../common/dto/pagination.input';
import ProductPagination from './entities/productpagination.entity';
import ShopPagination from '../shop/entities/shoppagination.entity';
import { CreateProduct } from './entities/createproduct.entity';
import { PrismaService } from 'src/prisma.service';
import { Shop } from 'src/shop/entities/shop.entity';
import { ProductImage } from 'src/product-image/entities/product-image.entity';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/clerk-auth.guard';
import { GqlClerkAuthGuard } from 'src/auth/gql-clerk-auth.guard';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField(() => Shop, { nullable: true })
  async shop(@Parent() product: Product) {
    if (!product.shop_id) {
      return null;
    }
    
    return this.prisma.shop.findUnique({
      where: { shop_id: product.shop_id }
    });
  }

  @ResolveField(() => [ProductImage], { nullable: true })
  async product_images(@Parent() product: Product) {
    if (!product.product_id) {
      return null;
    }
    
    return this.prisma.product_Image.findMany({
      where: { 
        product_id: product.product_id,
        is_thumbnail: true
      }
    });
  }

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

  @UseGuards(GqlClerkAuthGuard)
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

  @Query(() => Product, { name: 'productBySlug' })
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Mutation(() => Product)
  updateProduct(
    @Args('shopid', { type: () => String }) shopid: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productService.update(
      updateProductInput.product_id,
      updateProductInput,
      shopid,
    );
  }

  @Mutation(() => Product)
  removeProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productService.remove(id);
  }
}
