import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateVoucherInput {
  @Field(() => String)
  code: string;

  @Field(() => Float)
  discount_percent: number;

  @Field(() => Float)
  minimum_require_price: number;

  @Field(() => Float)
  max_discount_price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, { nullable: true })
  max_use_per_user: number;

  @Field(() => Date, { nullable: true })
  valid_from: Date;

  @Field(() => Date, { nullable: true })
  valid_to: Date;
}
