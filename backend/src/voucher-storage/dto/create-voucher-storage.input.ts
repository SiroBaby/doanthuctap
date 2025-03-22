import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVoucherStorageInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
