import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, IsOptional, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class InvoiceProductInput {
  @Field(() => Int)
  @IsNotEmpty()
  product_variation_id: number;

  @Field(() => String)
  @IsNotEmpty()
  product_name: string;

  @Field(() => String)
  @IsNotEmpty()
  variation_name: string;

  @Field(() => Float)
  @IsNotEmpty()
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  original_price?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  discount_percent?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  discount_amount?: number;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  @IsNotEmpty()
  user_id: string;

  @Field()
  @IsNotEmpty()
  shop_id: string;

  @Field()
  @IsNotEmpty()
  payment_method: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  shipping_address_id?: number;

  @Field(() => [InvoiceProductInput])
  @IsArray()
  @IsNotEmpty()
  products: InvoiceProductInput[];

  @Field(() => Float)
  @IsNotEmpty()
  @Min(0)
  total_amount: number;

  @Field(() => Float)
  @IsNotEmpty()
  @Min(0)
  shipping_fee: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  voucher_storage_id?: number;
} 