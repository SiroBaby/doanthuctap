import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RemoveExpiredVouchersResponse {
  @Field(() => Int)
  count: number;

  @Field(() => String)
  message: string;
} 