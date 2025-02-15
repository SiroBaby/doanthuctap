import { ObjectType, Field, Int } from '@nestjs/graphql';
import { isPhoneNumber } from 'class-validator';

@ObjectType()
export class ShopAddress {
    @Field (() => Int)
    address_id: number;

    @Field (() => String, {nullable: false})
    shop_id: string;

    @Field (() => String, {nullable: false})
    address: string;

    @Field (() => String, {nullable: false})
    phone: string;
}
