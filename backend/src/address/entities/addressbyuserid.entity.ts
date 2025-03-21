import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Address } from './address.entity';
@ObjectType()
export class AddressByUserId {

  @Field(() => [Address], { nullable: true })
  address?: Address[];
}
