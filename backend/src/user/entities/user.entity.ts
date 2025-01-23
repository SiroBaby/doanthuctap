import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => String)
  id_user: string;

  @Field(() => String)
  user_name: string;

  @Field(() => String)
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

  // Thêm 3 field thời gian
  @Field(() => Date, { nullable: true })
  create_at?: Date | null;

  @Field(() => Date, { nullable: true }) 
  update_at?: Date | null;

  @Field(() => Date, { nullable: true })
  delete_at?: Date | null;
}