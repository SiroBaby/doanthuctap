import { InputType, Field } from '@nestjs/graphql';
import { Shop_status } from '@prisma/client';

@InputType()
export class CreateShopInput {
  @Field(() => String)
  shop_id: string;

  @Field(() => String)
  shop_name: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => Shop_status)
  status: Shop_status;

  @Field(() => String)
  location_id: string;

  @Field(() => String)
  id_user: string;

  @Field(() => Date, { nullable: true })
  create_at?: Date;
}
