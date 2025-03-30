import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ReviewCheckResult {
    @Field(() => Boolean)
    canReview: boolean;

    @Field(() => Boolean)
    hasPurchased: boolean;

    @Field(() => Boolean)
    hasReviewed: boolean;

    @Field(() => String, { nullable: true })
    shopId?: string;
} 