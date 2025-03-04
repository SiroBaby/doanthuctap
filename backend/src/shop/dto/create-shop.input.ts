import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShopInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
