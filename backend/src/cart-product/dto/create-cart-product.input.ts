import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCartProductInput {
  @Field(() => String)
  cart_id: string;

  @Field(() => Int)
  product_variation_id: number;

  @Field(() => Int, { defaultValue: 1 })
  quantity: number;

  @Field(() => Boolean, { defaultValue: false })
  is_selected: boolean;
}
