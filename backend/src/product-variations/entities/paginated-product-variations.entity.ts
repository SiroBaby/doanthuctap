import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductVariation } from './product-variation.entity';

@ObjectType()
export class PaginatedProductVariations {
    @Field(() => [ProductVariation])
    data: ProductVariation[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPages: number;
}
