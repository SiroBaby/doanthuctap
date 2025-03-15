import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ShopVoucher } from './shop-voucher.entity';

@ObjectType()
export default class ShopVoucherPagination {
  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => Int, { nullable: true })
  totalPage: number;

  @Field(() => [ShopVoucher])
  data: ShopVoucher[];
}
