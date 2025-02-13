import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
