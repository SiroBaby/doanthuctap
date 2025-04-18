import { Field, InputType, Int, Float } from '@nestjs/graphql';

@InputType()
export class GetInvoicesByShopInput {
  @Field()
  shop_id: string;

  @Field({ nullable: true })
  order_status?: string;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field({ nullable: true })
  search?: string;

  @Field(() => Date, { nullable: true })
  start_date?: Date;

  @Field(() => Date, { nullable: true })
  end_date?: Date;

  @Field({ nullable: true })
  payment_method?: string;

  @Field(() => Float, { nullable: true })
  min_amount?: number;

  @Field(() => Float, { nullable: true })
  max_amount?: number;
} 