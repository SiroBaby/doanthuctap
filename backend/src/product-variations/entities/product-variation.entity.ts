import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Variation_status } from '@prisma/client';

@ObjectType()
export class ProductVariation {
  @Field(() => Int)
  product_variation_id: number;

  @Field()
  product_variation_name: string;

  @Field(() => Float)
  base_price: number;

  @Field(() => Float)
  percent_discount: number;

  @Field(() => Int)
  stock_quantity: number;

  @Field()
  status: Variation_status;

  @Field(() => Int)
  product_id: number;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;
}
