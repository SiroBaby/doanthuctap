import { CreateCategoryInput } from './create-category.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCategoryInput {
  @Field(() => Int)
  category_id: number;

  @Field(() => String, { nullable: false })
  category_name: string;
}
