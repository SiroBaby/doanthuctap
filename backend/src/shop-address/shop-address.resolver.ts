import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShopAddressService } from './shop-address.service';
import { ShopAddress } from './entities/shop-address.entity';
import { CreateShopAddressInput } from './dto/create-shop-address.input';
import { UpdateShopAddressInput } from './dto/update-shop-address.input';

@Resolver(() => ShopAddress)
export class ShopAddressResolver {
  constructor(private readonly shopAddressService: ShopAddressService) {}

  @Mutation(() => ShopAddress)
  createShopAddress(@Args('createShopAddressInput') createShopAddressInput: CreateShopAddressInput) {
    return this.shopAddressService.create(createShopAddressInput);
  }

  @Query(() => [ShopAddress], { name: 'shopAddresss' })
  findAll() {
    return this.shopAddressService.findAll();
  }

  @Query(() => ShopAddress, { name: 'shopAddress' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shopAddressService.findOne(id);
  }

  @Mutation(() => ShopAddress)
  updateShopAddress(@Args('updateShopAddressInput') updateShopAddressInput: UpdateShopAddressInput) {
    return this.shopAddressService.update(updateShopAddressInput.address_id, updateShopAddressInput);
  }

  @Mutation(() => ShopAddress)
  removeShopAddress(@Args('id', { type: () => Int }) id: number) {
    return this.shopAddressService.remove(id);
  }
}
