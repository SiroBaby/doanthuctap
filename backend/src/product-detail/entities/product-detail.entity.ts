import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductDetail {
  @Field(() => Int)
  product_detail_id: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  specifications?: string;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;
}
