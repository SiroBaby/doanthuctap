import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductImageInput {
  @Field(() => Int)
  product_id: number;

  @Field()
  image_url: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  is_thumbnail?: boolean;
}
