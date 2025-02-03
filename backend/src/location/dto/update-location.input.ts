import { CreateLocationInput } from './create-location.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLocationInput extends PartialType(CreateLocationInput) {
  @Field(() => String)
  location_id: string;

  @Field(() => String)
  location_name?: string;
}
