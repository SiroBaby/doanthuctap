import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Location {
  @Field(() => String)
  location_id: string;

  @Field(() => String)
  location_name: string;
}
