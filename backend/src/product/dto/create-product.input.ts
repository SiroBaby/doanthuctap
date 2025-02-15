import { InputType, Int, Field } from '@nestjs/graphql';
import { Product_status } from '@prisma/client';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  product_name: string;

  @Field(() => String)
  brand: string;

  @Field(() => String)
  status: Product_status;

  @Field(() => Int)
  category_id: number;

  @Field(() => Int)
  product_detail_id: number;

  @Field(() => String)
  shop_id: string;
}
