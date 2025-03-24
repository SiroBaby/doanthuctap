import { ObjectType, Field, Float, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Shop } from '../../shop/entities/shop.entity';
import { ProductImage } from '../../product-image/entities/product-image.entity';
import { ProductDetail } from '../../product-detail/entities/product-detail.entity';

export enum OrderStatus {
  WAITING_FOR_DELIVERY = 'WAITING_FOR_DELIVERY',
  PROCESSED = 'PROCESSED',
  DELIVERY = 'DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Status of the order',
});

@ObjectType()
export class SimpleShop {
  @Field()
  shop_id: string;

  @Field()
  shop_name: string;

  @Field()
  id_user: string;

  @Field({ nullable: true })
  link?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  location_id?: string;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;

  @Field(() => Date, { nullable: true })
  delete_at?: Date;
}

@ObjectType()
export class ShippingAddress {
  @Field(() => String, { nullable: true })
  address?: string;
  
  @Field(() => String, { nullable: true })
  phone?: string;
}

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

  @Field()
  shop_id: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => SimpleShop, { nullable: true })
  shop?: SimpleShop;

  @Field(() => ShippingAddress, { nullable: true })
  shipping_address?: ShippingAddress;

  @Field(() => [InvoiceProduct])
  invoice_products: InvoiceProduct[];

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
  
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ShippingAddress, { nullable: true })
  shipping_address?: ShippingAddress;
  
  @Field(() => [ProductVariationOrder], { nullable: true })
  products?: ProductVariationOrder[];
  
  @Field(() => [InvoiceProduct], { nullable: true })
  invoice_products?: InvoiceProduct[];
}

@ObjectType()
export class ProductVariationDetail {
  @Field()
  product_variation_name: string;

  @Field(() => Float)
  base_price: number;

  @Field(() => Float)
  percent_discount: number;

  @Field()
  status: string;

  @Field(() => [SimpleProductImage], { defaultValue: [] })
  product_images: SimpleProductImage[];
}

@ObjectType()
export class SimpleProductImage {
  @Field()
  image_url: string;

  @Field({ nullable: true })
  is_thumbnail?: boolean;
}

@ObjectType()
export class InvoiceProduct {
  @Field(() => Int)
  invoice_product_id: number;

  @Field()
  product_name: string;

  @Field()
  variation_name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  discount_percent: number;

  @Field(() => Float, { nullable: true })
  discount_amount?: number;

  @Field(() => Int)
  product_variation_id: number;

  @Field(() => ProductVariationDetail)
  product_variation: ProductVariationDetail;
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