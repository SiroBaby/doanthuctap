import { CreateShopAddressInput } from './create-shop-address.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShopAddressInput {
  @Field(() => Int)
  address_id: number;

  @Field(() => String)
  address: string;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  shop_id?: string;

  @Field(() => Boolean, { nullable: true })
  is_default?: boolean;
}
