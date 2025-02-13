import { ObjectType, Field } from '@nestjs/graphql';
import { IsEmail, isPhoneNumber } from 'class-validator';

@ObjectType()
export class User {
  @Field(() => String)
  id_user: string;

  @Field(() => String)
  user_name: string;

  @Field(() => String)
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String, { nullable: true }) 
  status?: string | null;

  @Field(() => String)
  role: string;

  @Field(() => Date, { nullable: true })
  create_at?: Date | null;

  @Field(() => Date, { nullable: true }) 
  update_at?: Date | null;

  @Field(() => Date, { nullable: true })
  delete_at?: Date | null;
}