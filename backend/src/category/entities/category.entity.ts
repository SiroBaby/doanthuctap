import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => Int)
  category_id: number;

  @Field(() => String, { nullable: false })
  category_name: string;

  @Field(() => Date, { nullable: true })
  create_at: Date;

  @Field(() => Date, { nullable: true })
  update_at: Date;

  @Field(() => Date, { nullable: true })
  delete_at: Date;
}
