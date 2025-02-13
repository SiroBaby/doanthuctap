import { Module } from '@nestjs/common';
import { ShopAddressService } from './shop-address.service';
import { ShopAddressResolver } from './shop-address.resolver';

@Module({
  providers: [ShopAddressResolver, ShopAddressService],
})
export class ShopAddressModule {}
