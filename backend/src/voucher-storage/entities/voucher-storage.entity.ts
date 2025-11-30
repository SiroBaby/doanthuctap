import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Voucher_type } from '@prisma/client';
import { ShopVoucher } from '../../shop-voucher/entities/shop-voucher.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';

registerEnumType(Voucher_type, {
  name: 'Voucher_type',
  description: 'Loại voucher',
});

@ObjectType()
export class VoucherStorage {
  @Field(() => Int)
  voucher_storage_id: number;

  @Field(() => String)
  user_id: string;

  @Field(() => Int)
  voucher_id: number;

  @Field(() => Voucher_type)
  voucher_type: Voucher_type;

  @Field(() => Date, { nullable: true })
  claimed_at: Date;

  @Field(() => Boolean)
  is_used: boolean;

  @Field(() => Date, { nullable: true })
  used_at: Date;

  @Field(() => Voucher, { nullable: true })
  voucher: Voucher;

  @Field(() => ShopVoucher, { nullable: true })
  shop_voucher: ShopVoucher;
}
