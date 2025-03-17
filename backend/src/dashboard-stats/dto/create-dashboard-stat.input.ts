import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDashboardStatInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
