import { InputType, Field, Int } from '@nestjs/graphql';
import { Product_status } from '@prisma/client';

@InputType()
export class UpdateProductInput {
  @Field(() => Int)
  product_id: number;

  @Field(() => String, { nullable: true })
  product_name?: string;

  @Field(() => String, { nullable: true })
  brand?: string;

  @Field(() => String, { nullable: true })
  status?: Product_status;

  @Field(() => Int, { nullable: true })
  category_id?: number;

  @Field(() => Int, { nullable: true })
  product_detail_id?: number;

  @Field(() => String, { nullable: true })
  shop_id?: string;
}
