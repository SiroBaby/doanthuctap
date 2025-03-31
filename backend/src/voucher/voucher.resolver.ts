import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VoucherService } from './voucher.service';
import { Voucher } from './entities/voucher.entity';
import { CreateVoucherInput } from './dto/create-voucher.input';
import { UpdateVoucherInput } from './dto/update-voucher.input';
import { PaginationInput } from '../common/dto/pagination.input';
import VoucherPagination from './entities/voucherpagination.entity';

@Resolver(() => Voucher)
export class VoucherResolver {
  constructor(private readonly voucherService: VoucherService) {}

  @Mutation(() => Voucher)
  createVoucher(
    @Args('createVoucherInput') createVoucherInput: CreateVoucherInput,
  ) {
    return this.voucherService.create(createVoucherInput);
  }

  @Query(() => VoucherPagination, { name: 'vouchers' })
  findAll(
    @Args('paginationInput', { type: () => PaginationInput })
    pagination: PaginationInput,
  ) {
    return this.voucherService.findAll(pagination);
  }

  @Query(() => Voucher, { name: 'voucher' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.voucherService.findOne(id);
  }

  @Mutation(() => Voucher)
  updateVoucher(
    @Args('updateVoucherInput') updateVoucherInput: UpdateVoucherInput,
  ) {
    return this.voucherService.update(
      updateVoucherInput.id,
      updateVoucherInput,
    );
  }

  @Mutation(() => Voucher)
  removeVoucher(@Args('id', { type: () => Int }) id: number) {
    return this.voucherService.remove(id);
  }

  @Query(() => [Voucher], { name: 'getLatestValidVouchers' })
  async getLatestValidVouchers(@Args('limit', { type: () => Int }) limit: number) {
    return this.voucherService.getLatestValidVouchers(limit);
  }
}
