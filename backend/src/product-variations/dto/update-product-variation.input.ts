import { CreateProductVariationInput } from './create-product-variation.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProductVariationInput extends PartialType(CreateProductVariationInput) {
  @Field(() => Int)
  product_variation_id: number;
}
