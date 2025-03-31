import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VoucherStorageService } from './voucher-storage.service';
import { VoucherStorage } from './entities/voucher-storage.entity';
import { CreateVoucherStorageInput } from './dto/create-voucher-storage.input';
import { UpdateVoucherStorageInput } from './dto/update-voucher-storage.input';
import { RemoveExpiredVouchersResponse } from './entities/remove-expired-vouchers.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

@Resolver(() => VoucherStorage)
export class VoucherStorageResolver {
  constructor(private readonly voucherStorageService: VoucherStorageService) {}

  @Mutation(() => VoucherStorage)
  async createVoucherStorage(
    @Args('createVoucherStorageInput') createVoucherStorageInput: CreateVoucherStorageInput,
  ) {
    try {
      return await this.voucherStorageService.create(createVoucherStorageInput);
    } catch (error) {
      if (error.message.includes('đã lưu mã giảm giá này')) {
        throw new HttpException('Bạn đã lưu mã giảm giá này rồi', HttpStatus.CONFLICT);
      } else if (error.message.includes('Không tìm thấy mã giảm giá')) {
        throw new HttpException('Mã giảm giá không tồn tại hoặc không hợp lệ', HttpStatus.NOT_FOUND);
      } else if (error.message.includes('Mã giảm giá không tồn tại trong hệ thống')) {
        throw new HttpException('Mã giảm giá không tồn tại trong hệ thống', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Không thể lưu mã giảm giá: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
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

  @Mutation(() => RemoveExpiredVouchersResponse)
  removeExpiredVouchers(@Args('userId', { type: () => String }) userId: string) {
    return this.voucherStorageService.removeExpiredVouchers(userId);
  }
}
