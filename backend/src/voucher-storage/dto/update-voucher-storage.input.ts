import { CreateVoucherStorageInput } from './create-voucher-storage.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateVoucherStorageInput extends PartialType(CreateVoucherStorageInput) {
  @Field(() => Int)
  id: number;
}
