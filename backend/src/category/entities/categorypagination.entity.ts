import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

@ObjectType()
export class CategoryPagination {
    @Field(() => [Category])
    data: Category[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPage: number;
}