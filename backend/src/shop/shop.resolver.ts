import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShopService } from './shop.service';
import { Shop } from './entities/shop.entity';
import { CreateShopInput } from './dto/create-shop.input';
import { UpdateShopInput } from './dto/update-shop.input';

@Resolver(() => Shop)
export class ShopResolver {
  constructor(private readonly shopService: ShopService) {}

  @Mutation(() => Shop)
  createShop(@Args('createShopInput') createShopInput: CreateShopInput) {
    return this.shopService.create(createShopInput);
  }

  @Query(() => [Shop], { name: 'shop' })
  findAll() {
    return this.shopService.findAll();
  }

  @Query(() => Shop, { name: 'shop' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shopService.findOne(id);
  }

  @Mutation(() => Shop)
  updateShop(@Args('updateShopInput') updateShopInput: UpdateShopInput) {
    return this.shopService.update(updateShopInput.id, updateShopInput);
  }

  @Mutation(() => Shop)
  removeShop(@Args('id', { type: () => Int }) id: number) {
    return this.shopService.remove(id);
  }
}
