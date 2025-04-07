import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GetUserChatsInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  userId: string;
} 