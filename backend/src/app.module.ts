import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { WebhooksModule } from './webhooks/webhooks.module';
import { LocationModule } from './location/location.module';
import { AddressModule } from './address/address.module';
import { ShopAddressModule } from './shop-address/shop-address.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
  UserModule,
  WebhooksModule, 
  LocationModule, 
  GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true,
    }), AddressModule, ShopAddressModule, CategoryModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
