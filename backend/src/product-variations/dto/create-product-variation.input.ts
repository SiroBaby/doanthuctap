import { InputType, Int, Field, Float, registerEnumType } from '@nestjs/graphql';
import { Variation_status } from '@prisma/client';

@InputType()
export class CreateProductVariationInput {
  @Field()
  product_variation_name: string;

  @Field(() => Float)
  base_price: number;

  @Field(() => Float)
  percent_discount: number;

  @Field(() => Int)
  stock_quantity: number;

  @Field(() => String)
  status: Variation_status;

  @Field(() => Int)
  product_id: number;
}
