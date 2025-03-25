import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field(() => Int)
  address_id: number;

  @Field(() => String, {nullable: false})
  address_name: string;

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

  @Field(() => Date, { nullable: true })
  create_at?: Date | null;

  @Field(() => Date, { nullable: true }) 
  update_at?: Date | null;

  @Field(() => Date, { nullable: true })
  delete_at?: Date | null;
}
