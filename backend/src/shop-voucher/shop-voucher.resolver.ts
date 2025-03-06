import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShopVoucherService } from './shop-voucher.service';
import { ShopVoucher } from './entities/shop-voucher.entity';
import { CreateShopVoucherInput } from './dto/create-shop-voucher.input';
import { UpdateShopVoucherInput } from './dto/update-shop-voucher.input';

@Resolver(() => ShopVoucher)
export class ShopVoucherResolver {
  constructor(private readonly shopVoucherService: ShopVoucherService) {}

  @Mutation(() => ShopVoucher)
  createShopVoucher(
    @Args('createShopVoucherInput')
    createShopVoucherInput: CreateShopVoucherInput,
  ) {
    return this.shopVoucherService.create(createShopVoucherInput);
  }

  @Query(() => [ShopVoucher], { name: 'shopVouchers' })
  findAll() {
    return this.shopVoucherService.findAll();
  }

  @Query(() => ShopVoucher, { name: 'shopVoucher' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shopVoucherService.findOne(id);
  }

  @Mutation(() => ShopVoucher)
  updateShopVoucher(
    @Args('updateShopVoucherInput')
    updateShopVoucherInput: UpdateShopVoucherInput,
  ) {
    return this.shopVoucherService.update(
      updateShopVoucherInput.id,
      updateShopVoucherInput,
    );
  }

  @Mutation(() => ShopVoucher)
  removeShopVoucher(@Args('id', { type: () => Int }) id: number) {
    return this.shopVoucherService.remove(id);
  }
}
