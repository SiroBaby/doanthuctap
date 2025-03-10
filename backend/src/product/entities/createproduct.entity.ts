import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Product_status } from '@prisma/client';

registerEnumType(Product_status, {
  name: 'Product_status',
  description: 'Trạng thái của sản phẩm',
});

@ObjectType()
export class CreateProduct {
  @Field(() => Int)
  product_id: number;

  @Field(() => String)
  product_name: string;

  @Field(() => String)
  brand: string;

  @Field(() => Product_status)
  status: Product_status;

  @Field(() => Int)
  category_id: number;

  @Field(() => Int)
  product_detail_id: number;

  @Field(() => String)
  shop_id: string;
}
