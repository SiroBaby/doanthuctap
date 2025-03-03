import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductImage {
  @Field(() => Int)
  image_id: number;

  @Field(() => Int)
  product_id: number;

  @Field()
  image_url: string;

  @Field(() => Boolean, { nullable: true })
  is_thumbnail?: boolean;

  @Field(() => Date, { nullable: true })
  create_at?: Date;
}
