import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, Min } from "class-validator";

@InputType()
export class ReviewPaginationInput {
    @Field(() => Int, { defaultValue: 1 })
    @IsNumber()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @Field(() => Int, { defaultValue: 10 })
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit: number = 10;
} 