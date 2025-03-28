import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateChatDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  id_user: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  shop_id: string;
} 