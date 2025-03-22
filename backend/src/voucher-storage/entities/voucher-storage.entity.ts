import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Voucher_type } from '@prisma/client';
import { ShopVoucher } from 'src/shop-voucher/entities/shop-voucher.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';

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

  @Field(() => String)
  voucher_id: string;

  @Field(() => Voucher_type)
  voucher_type: Voucher_type;

  @Field(() => Date, { nullable: true })
  claimed_at: Date;

  @Field(() => Voucher, { nullable: true })
  voucher: Voucher;

  @Field(() => ShopVoucher, { nullable: true })
  shop_voucher: ShopVoucher;
}
