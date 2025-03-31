import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { Voucher_type } from '@prisma/client';

registerEnumType(Voucher_type, {
  name: 'Voucher_type',
  description: 'Loại voucher',
});

@InputType()
export class CreateVoucherStorageInput {
  @Field(() => String)
  user_id: string;

  @Field(() => Int)
  voucher_id: number;

  @Field(() => Voucher_type)
  voucher_type: Voucher_type;

  @Field(() => Date, { nullable: true })
  claimed_at?: Date;

  @Field(() => Boolean, { defaultValue: false })
  is_used?: boolean;
}
