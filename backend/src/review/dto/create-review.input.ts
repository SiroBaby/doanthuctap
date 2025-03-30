import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  id_user: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_review?: boolean;
} 