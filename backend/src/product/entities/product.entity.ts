import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Product_status } from '@prisma/client';
import { Category } from 'src/category/entities/category.entity';
import { ProductDetail } from 'src/product-detail/entities/product-detail.entity';
import { ProductImage } from 'src/product-image/entities/product-image.entity';
import { ProductVariation } from 'src/product-variations/entities/product-variation.entity';
import { Shop } from 'src/shop/entities/shop.entity';

registerEnumType(Product_status, {
  name: 'Product_status',
  description: 'Trạng thái của sản phẩm',
});

@ObjectType()
export class Product {
  @Field(() => Int)
  product_id: number;

  @Field(() => String)
  product_name: string;

  @Field(() => String)
  brand: string;

  @Field(() => Product_status)
  status: Product_status;

  @Field(() => Category)
  category: Category;

  @Field(() => Int)
  product_detail_id: number;

  @Field(() => Shop, { nullable: true })
  shop?: Shop;

  @Field(() => ProductDetail)
  product_detail: ProductDetail;

  @Field(() => [ProductImage])
  product_images: ProductImage[];

  @Field(() => [ProductVariation])
  product_variations: ProductVariation[];
}
