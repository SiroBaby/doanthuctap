import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { CartProductService } from './cart-product.service';
import { CartProduct } from './entities/cart-product.entity';
import { CreateCartProductInput } from './dto/create-cart-product.input';
import { UpdateCartProductInput } from './dto/update-cart-product.input';
import { Product } from 'src/product/entities/product.entity';
import { PrismaService } from 'src/prisma.service';

@Resolver(() => CartProduct)
export class CartProductResolver {
  constructor(
    private readonly cartProductService: CartProductService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation(() => CartProduct)
  addProductToCart(@Args('addProductToCartInput') addProductToCartInput: CreateCartProductInput) {
    return this.cartProductService.addProductToCart(addProductToCartInput);
  }

  
  @Query(() => [CartProduct], { name: 'getCartProducts' })
  getCartProducts(@Args('cart_id', { type: () => String }) cart_id: string) {
    return this.cartProductService.getCartProducts(cart_id);
  }


  @ResolveField(() => Product, { nullable: true })
  async product(@Parent() cartProduct: CartProduct) {
    if (!cartProduct.product_variation) {
      return null;
    }
    
    const productId = cartProduct.product_variation.product_id;
    return this.prisma.product.findUnique({
      where: { product_id: productId }
    });
  }

  // createCartProduct(@Args('createCartProductInput') createCartProductInput: CreateCartProductInput) {
  //   return this.cartProductService.create(createCartProductInput);
  // }

  // @Query(() => [CartProduct], { name: 'cartProduct' })
  // findAll() {
  //   return this.cartProductService.findAll();
  // }

  @Query(() => CartProduct, { name: 'cartProduct' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.cartProductService.findOne(id);
  }

  @Mutation(() => CartProduct)
  updateCartProduct(@Args('updateCartProductInput') updateCartProductInput: UpdateCartProductInput) {
    return this.cartProductService.update(updateCartProductInput.id, updateCartProductInput);
  }

  @Mutation(() => CartProduct)
  removeCartProduct(
    @Args('cartproductid', { type: () => Int }) cartproductid: number,
    @Args('productvariationid', { type: () => Int }) productvariationid: number) {
    return this.cartProductService.remove(cartproductid, productvariationid);
  }
}
