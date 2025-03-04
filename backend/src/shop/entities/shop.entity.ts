import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Shop_status } from '@prisma/client';

registerEnumType(Shop_status, {
  name: 'Shop_status',
  description: 'Trạng thái của cửa hàng',
});


@ObjectType()
export class Shop {
  @Field(() => String)
  shop_id: string;

  @Field(() => String)
  id_user: string;

  @Field(() => String)
  shop_name: string;

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => Shop_status)
  status: Shop_status;

  @Field(() => String)
  location_id: string;

  @Field(() => Date, { nullable: true })
  create_at: Date;

  @Field(() => Date, { nullable: true })
  update_at: Date;

  @Field(() => Date, { nullable: true })
  delete_at: Date;

}
