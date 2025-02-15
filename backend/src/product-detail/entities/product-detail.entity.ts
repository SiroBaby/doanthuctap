import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductDetail {
  @Field(() => Int)
  product_detail_id: number;

  @Field(() => String)
  description: string;

  @Field(() => String)
  specifications: string;

  @Field(() => Date)
  create_at: Date;

  @Field(() => Date)
  update_at: Date;
}
