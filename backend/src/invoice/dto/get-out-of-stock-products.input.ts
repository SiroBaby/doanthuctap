import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetOutOfStockProductsInput {
  @Field()
  shop_id: string;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;
} 