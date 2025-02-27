import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@ObjectType()
export class UserPagination {
    @Field(() => [User], { nullable: true })
    data: User[];

    @Field(() => Int, { nullable: true })
    totalCount: number;

    @Field(() => Int, { nullable: true })
    totalPage: number;
}