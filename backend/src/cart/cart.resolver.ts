import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CreateCartInput } from './dto/create-cart.input';
import { UpdateCartInput } from './dto/update-cart.input';
import { CartProduct } from 'src/cart-product/entities/cart-product.entity';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { name: 'getcart' })
  getCart(@Args('id', { type: () => String }) id: string) {
    return this.cartService.getOrCreateCart(id);
  }


  @Mutation(() => Cart)
  createCart(@Args('createCartInput') createCartInput: CreateCartInput) {
    return this.cartService.create(createCartInput);
  }

  // @Query(() => [Cart], { name: 'carts' })
  // findAll() {
  //   return this.cartService.findAll();
  // }

  // @Query(() => Cart, { name: 'cart' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.cartService.findOne(id);
  // }

  @Mutation(() => Cart)
  updateCart(@Args('updateCartInput') updateCartInput: UpdateCartInput) {
    return this.cartService.update(updateCartInput.id, updateCartInput);
  }

  @Mutation(() => Cart)
  removeCart(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.remove(id);
  }
}
