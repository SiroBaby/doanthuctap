import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Cart_status } from '@prisma/client';
import { CartProduct } from '../../cart-product/entities/cart-product.entity';

registerEnumType(Cart_status, {
  name: 'Cart_status',
  description: 'Trạng thái của giỏ hàng',
});

@ObjectType()
export class Cart {
  @Field(() => String)
  cart_id: string;

  @Field(() => String)
  id_user: string;

  @Field(() => Cart_status)
  status: Cart_status;
  
  @Field(() => Date, { nullable: true })
  create_at?: Date;

  @Field(() => Date, { nullable: true })
  update_at?: Date;

  @Field(() => [CartProduct])
  cart_products: CartProduct[];
}
