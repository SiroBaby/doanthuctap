import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Voucher } from '../../voucher/entities/voucher.entity';

@ObjectType()
export class ShopVoucher extends Voucher {
  @Field(() => String)
  shop_id: string;
}
