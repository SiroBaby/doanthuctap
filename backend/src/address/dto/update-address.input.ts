import { CreateAddressInput } from './create-address.input';
import { InputType, Field, PartialType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateAddressInput extends PartialType(CreateAddressInput) {
  @Field(() => Int, {nullable: false})
  address_id: number;

  @Field(() => String, {nullable: false})
  address_name: string;

  @Field(() => String, {nullable: false})
  full_name: string;

  @Field(() => String, {nullable: false})
  phone: string;

  @Field(() => String, {nullable: false})
  address: string;

  @Field(() => Boolean, {nullable: true})
  is_default: boolean;
}
