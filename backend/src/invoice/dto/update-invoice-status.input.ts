import { Field, InputType } from '@nestjs/graphql';
import { OrderStatus } from '../entities/invoice.entity';

@InputType()
export class UpdateInvoiceStatusInput {
  @Field()
  invoice_id: string;

  @Field()
  order_status: OrderStatus;
} 