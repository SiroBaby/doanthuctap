import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Chat_Message } from './chat-message.entity';
import { User } from '../../user/entities/user.entity';
import { Shop } from '../../shop/entities/shop.entity';

@ObjectType()
export class Chat {
  @Field(() => ID)
  chat_id: string;

  @Field()
  id_user: string;

  @Field()
  shop_id: string;

  @Field(() => Date, { nullable: true })
  last_message_at?: Date;

  @Field(() => Date)
  create_at: Date;

  @Field(() => Date)
  update_at: Date;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Shop, { nullable: true })
  shop?: Shop;

  @Field(() => [Chat_Message], { nullable: true })
  messages?: Chat_Message[];
} 