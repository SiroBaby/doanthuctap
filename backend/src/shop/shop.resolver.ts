import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShopService } from './shop.service';
import { Shop } from './entities/shop.entity';
import { CreateShopInput } from './dto/create-shop.input';
import { UpdateShopInput } from './dto/update-shop.input';
import { PaginationInput } from 'src/common/dto/pagination.input';
import ShopPagination from './entities/shoppagination.entity';
import { User } from '../user/entities/user.entity';

@Resolver(() => Shop)
export class ShopResolver {
  constructor(private readonly shopService: ShopService) {}

  @Mutation(() => Shop)
  createShop(@Args('createShopInput') createShopInput: CreateShopInput) {
    return this.shopService.create(createShopInput);
  }

  @Query(() => ShopPagination, { name: 'shops' })
  findAll(
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ) {
    return this.shopService.findAll(pagination);
  }

  @Query(() => Shop, { name: 'shop' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.shopService.findOne(id);
  }

  @Query(() => Shop, { name: 'getShopIdByUserId' })
  getShopIdByUserId(@Args('id', { type: () => String }) id: string) {
    return this.shopService.getShopIdByUserId(id);
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
