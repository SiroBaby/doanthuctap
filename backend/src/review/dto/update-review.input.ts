import { CreateReviewInput } from './create-review.input';
import { InputType, Field, Int, PartialType, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class UpdateReviewInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  review_id: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
} 