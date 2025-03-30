import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

@ObjectType()
export class Review {
  @Field(() => Int)
  review_id: number;

  @Field(() => Float)
  rating: number;

  @Field(() => String, { nullable: true })
  comment: string | null;

  @Field(() => Boolean, { nullable: true })
  is_review: boolean | null;

  @Field(() => Int)
  product_id: number;

  @Field(() => String)
  id_user: string;

  @Field(() => Date, { nullable: true })
  create_at: Date | null;

  @Field(() => Date, { nullable: true })
  update_at: Date | null;

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => User, { nullable: true })
  user?: User;
} 