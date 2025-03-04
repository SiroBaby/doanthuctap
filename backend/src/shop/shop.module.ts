import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopResolver } from './shop.resolver';

@Module({
  providers: [ShopResolver, ShopService],
})
export class ShopModule {}
