import { CreateShopAddressInput } from './create-shop-address.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShopAddressInput extends PartialType(CreateShopAddressInput) {
  @Field(() => Int)
  id: number;
}
