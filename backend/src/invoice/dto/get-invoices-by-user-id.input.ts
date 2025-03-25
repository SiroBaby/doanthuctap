import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderStatus } from '../entities/invoice.entity';

@InputType()
export class GetInvoicesByUserIdInput {
  @Field()
  userId: string;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
} 