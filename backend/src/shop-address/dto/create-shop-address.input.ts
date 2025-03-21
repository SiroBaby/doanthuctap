import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShopAddressInput {
  @Field(() => String)
  address: string;

  @Field(() => String)
  shop_id: string;

  @Field(() => String)
  phone: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  is_default?: boolean;
}
