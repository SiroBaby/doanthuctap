import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Product } from "./product.entity";

@ObjectType()
export default class ProductPagination {
    @Field(() => [Product])
    data: Product[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPage: number;
}