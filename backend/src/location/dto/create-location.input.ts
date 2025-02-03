import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateLocationInput {
  @Field(() => String)
  location_id: string;
  
  @Field(() => String)
  location_name: string;
}
