import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Voucher } from './voucher.entity';

@ObjectType()
export default class VoucherPagination {
  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => Int, { nullable: true })
  totalPage: number;

  @Field(() => [Voucher])
  data: Voucher[];
}
