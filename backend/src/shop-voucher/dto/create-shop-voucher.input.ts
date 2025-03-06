import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShopVoucherInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
