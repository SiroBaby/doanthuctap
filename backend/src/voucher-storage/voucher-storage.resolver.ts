import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VoucherStorageService } from './voucher-storage.service';
import { VoucherStorage } from './entities/voucher-storage.entity';
import { CreateVoucherStorageInput } from './dto/create-voucher-storage.input';
import { UpdateVoucherStorageInput } from './dto/update-voucher-storage.input';

@Resolver(() => VoucherStorage)
export class VoucherStorageResolver {
  constructor(private readonly voucherStorageService: VoucherStorageService) {}

  @Mutation(() => VoucherStorage)
  createVoucherStorage(@Args('createVoucherStorageInput') createVoucherStorageInput: CreateVoucherStorageInput) {
    return this.voucherStorageService.create(createVoucherStorageInput);
  }

  @Query(() => [VoucherStorage], { name: 'getUserVouchersByUserId' })
  getUserVouchersByUserId(
    @Args('userId') userId: string,
  ) {
    return this.voucherStorageService.getUserVouchersByUserId(userId);
  }

  @Query(() => [VoucherStorage], { name: 'getUserVouchersForCheckout' })
  getUserVouchersForCheckout(
    @Args('userId') userId: string,
    @Args('shopId') shopId: string,
  ) {
    return this.voucherStorageService.getUserVouchersForCheckout(userId, shopId);
  }

  @Query(() => [VoucherStorage], { name: 'voucherStorage' })
  findAll() {
    return this.voucherStorageService.findAll();
  }

  @Query(() => VoucherStorage, { name: 'voucherStorage' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.voucherStorageService.findOne(id);
  }

  @Mutation(() => VoucherStorage)
  updateVoucherStorage(@Args('updateVoucherStorageInput') updateVoucherStorageInput: UpdateVoucherStorageInput) {
    return this.voucherStorageService.update(updateVoucherStorageInput.id, updateVoucherStorageInput);
  }

  @Mutation(() => VoucherStorage)
  removeVoucherStorage(@Args('id', { type: () => Int }) id: number) {
    return this.voucherStorageService.remove(id);
  }
}
