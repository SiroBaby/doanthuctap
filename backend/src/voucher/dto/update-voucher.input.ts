import { CreateVoucherInput } from './create-voucher.input';
import { InputType, Field, Int, PartialType, Float } from '@nestjs/graphql';

@InputType()
export class UpdateVoucherInput extends PartialType(CreateVoucherInput) {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  discount_percent: number;

  @Field(() => Float)
  minimum_require_price: number;

  @Field(() => Float)
  max_discount_price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  max_use_per_user: number;

  @Field(() => Date)
  valid_from: Date;

  @Field(() => Date)
  valid_to: Date;
}
