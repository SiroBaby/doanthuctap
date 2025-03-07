import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Voucher {
  @Field(() => Int)
  id: number;

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

  @Field(() => Date, { nullable: true })
  create_at: Date;

  @Field(() => Date, { nullable: true })
  delete_at: Date;
}
