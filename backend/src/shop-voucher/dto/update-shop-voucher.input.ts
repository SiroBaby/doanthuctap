import { CreateShopVoucherInput } from './create-shop-voucher.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShopVoucherInput extends PartialType(CreateShopVoucherInput) {
  @Field(() => Int)
  id: number;
}
