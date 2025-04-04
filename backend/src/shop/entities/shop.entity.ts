import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Shop_status } from '@prisma/client';
import { ShopAddress } from '../../shop-address/entities/shop-address.entity';
import { Location } from '../../location/entities/location.entity';
import { ShopVoucher } from '../../shop-voucher/entities/shop-voucher.entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

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
  logo: string;

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

  @Field(() => [ShopAddress], { nullable: true })
  shop_addresses: ShopAddress[];

  @Field(() => Location, { nullable: true })
  location: Location;

  @Field(() => [ShopVoucher], { nullable: true })
  shop_vouchers: ShopVoucher[];

  @Field(() => User)
  user: User;

  @Field(() => [Product], { nullable: true })
  products: Product[];
}
