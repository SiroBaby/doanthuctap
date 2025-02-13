import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAddressInput {
  @Field(() => String, {nullable: false})
  full_name: string;

  @Field(() => String, {nullable: false})
  phone: string;

  @Field(() => String, {nullable: false})
  address: string;

  @Field(() => String, {nullable: false})
  id_user: string;

  @Field(() => Boolean, {nullable: true})
  is_default: boolean;
}
