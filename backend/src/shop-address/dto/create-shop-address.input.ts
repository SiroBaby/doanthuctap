import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShopAddressInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
