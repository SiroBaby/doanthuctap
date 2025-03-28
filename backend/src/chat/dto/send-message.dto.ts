import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SendMessageDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  chat_id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  sender_id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;
} 