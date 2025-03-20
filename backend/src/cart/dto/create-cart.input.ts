import { InputType, Int, Field } from '@nestjs/graphql';
import { Cart_status } from '@prisma/client';

@InputType()
export class CreateCartInput {
  @Field(() => String)
  cart_id: string;

  @Field(() => String)
  id_user: string;

  @Field(() => Cart_status)
  status: Cart_status;
}
