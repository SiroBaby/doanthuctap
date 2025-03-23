import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetAllInvoicesInput {
  @Field({ nullable: true })
  order_status?: string;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field({ nullable: true })
  search?: string;
} 