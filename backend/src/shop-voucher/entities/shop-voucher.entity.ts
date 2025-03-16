import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { Shop } from '../../shop/entities/shop.entity';

@ObjectType()
export class ShopVoucher extends Voucher {
  @Field(() => String)
  shop_id: string;

  @Field(() => Shop, { nullable: true })
  shop?: Shop;
}
