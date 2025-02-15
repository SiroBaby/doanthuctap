import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductDetailInput {
  @Field(() => String, {nullable: false})
  description: string;

  @Field(() => String)
  specifications: string;
}
