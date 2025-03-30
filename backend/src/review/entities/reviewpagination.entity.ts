import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Review } from "./review.entity";

@ObjectType()
export default class ReviewPagination {
    @Field(() => [Review])
    data: Review[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPage: number;
} 