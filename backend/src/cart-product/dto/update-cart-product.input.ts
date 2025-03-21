import { CreateCartProductInput } from './create-cart-product.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCartProductInput extends PartialType(CreateCartProductInput) {
  @Field(() => Int)
  id: number;
}
