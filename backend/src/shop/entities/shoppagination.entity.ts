import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Shop } from "./shop.entity";

@ObjectType()
export default class ShopPagination {
    @Field(() => [Shop])
    data: Shop[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPage: number;
}