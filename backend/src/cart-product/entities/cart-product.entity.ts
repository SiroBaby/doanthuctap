import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from '../../product/entities/product.entity';
import { ProductVariation } from '../../product-variations/entities/product-variation.entity';

@ObjectType()
export class CartProduct {
  @Field(() => Int)
  cart_product_id: number;

  @Field(() => String)
  cart_id: string;

  @Field(() => Int)
  product_variation_id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;

  @Field(() => Boolean)
  is_selected: boolean;

  @Field(() => ProductVariation)
  product_variation: ProductVariation;

  @Field(() => Product, { nullable: true })
  product?: Product;
}
