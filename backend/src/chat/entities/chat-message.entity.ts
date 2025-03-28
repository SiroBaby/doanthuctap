import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum SenderType {
  USER = 'user',
  SHOP = 'shop'
}

registerEnumType(SenderType, {
  name: 'SenderType',
});

@ObjectType()
export class Chat_Message {
  @Field(() => ID)
  message_id: number;

  @Field()
  chat_id: string;

  @Field(() => SenderType)
  sender_type: SenderType;

  @Field()
  sender_id: string;

  @Field()
  message: string;

  @Field(() => Date)
  sent_at: Date;

  @Field(() => Boolean)
  is_read: boolean;
} 