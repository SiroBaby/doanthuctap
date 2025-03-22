import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WebhooksModule } from './webhooks/webhooks.module';
import { LocationModule } from './location/location.module';
import { AddressModule } from './address/address.module';
import { ShopAddressModule } from './shop-address/shop-address.module';
import { CategoryModule } from './category/category.module';
import { ProductDetailModule } from './product-detail/product-detail.module';
import { ProductModule } from './product/product.module';
import { ProductImageModule } from './product-image/product-image.module';
import { ProductVariationsModule } from './product-variations/product-variations.module';
import { UploadModule } from './file-upload/file-upload.module';
import { ShopModule } from './shop/shop.module';
import { ShopVoucherModule } from './shop-voucher/shop-voucher.module';
import { VoucherModule } from './voucher/voucher.module';
import { DashboardStatsModule } from './dashboard-stats/dashboard-stats.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CartModule } from './cart/cart.module';
import { CartProductModule } from './cart-product/cart-product.module';
import { VoucherStorageModule } from './voucher-storage/voucher-storage.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    WebhooksModule,
    LocationModule,
    AddressModule,
    ShopAddressModule,
    CategoryModule,
    ProductDetailModule,
    ProductModule,
    ProductImageModule,
    ProductVariationsModule,
    UploadModule,
    ShopModule,
    ShopVoucherModule,
    VoucherModule,
    DashboardStatsModule,
    InvoiceModule,
    CartModule,
    CartProductModule,
    VoucherStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
