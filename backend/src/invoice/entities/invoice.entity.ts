import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

export enum OrderStatus {
  WAITING_FOR_DELIVERY = 'waiting_for_delivery',
  PROCESSED = 'processed',
  DELIVERY = 'delivery',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Status of the order',
});

@ObjectType()
export class Invoice {
  @Field()
  invoice_id: string;

  @Field({ nullable: true })
  payment_method?: string;

  @Field({ nullable: true })
  payment_status?: string;
  
  @Field()
  order_status: string;

  @Field(() => Float)
  total_amount: number;

  @Field(() => Float)
  shipping_fee: number;

  @Field()
  id_user: string;

  @Field()
  cart_id: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;
}

@ObjectType()
export class ProductVariationOrder {
  @Field(() => String)
  product_variation_name: string;

  @Field(() => Float)
  base_price: number;

  @Field(() => Float)
  percent_discount: number;

  @Field(() => String)
  status: string;

  @Field(() => String)
  product_name: string;

  @Field(() => String)
  shop_id: string;

  @Field(() => String)
  shop_name: string;

  @Field(() => String, { nullable: true })
  image_url?: string;

  @Field(() => Number)
  quantity: number;
}

@ObjectType()
export class InvoiceDetail {
  @Field()
  invoice_id: string;

  @Field({ nullable: true })
  payment_method?: string;

  @Field({ nullable: true })
  payment_status?: string;

  @Field()
  order_status: string;

  @Field(() => Float)
  total_amount: number;

  @Field(() => Float)
  shipping_fee: number;

  @Field(() => String)
  user_name: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => [ProductVariationOrder], { nullable: true })
  products?: ProductVariationOrder[];
}

@ObjectType()
export class InvoicePagination {
  @Field(() => [Invoice])
  data: Invoice[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  totalPage: number;
} 