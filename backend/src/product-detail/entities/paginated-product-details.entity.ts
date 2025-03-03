import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductDetail } from './product-detail.entity';

@ObjectType()
export class PaginatedProductDetails {
    @Field(() => [ProductDetail])
    items: ProductDetail[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    totalPages: number;
}
