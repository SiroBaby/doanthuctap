import { CreateDashboardStatInput } from './create-dashboard-stat.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDashboardStatInput extends PartialType(CreateDashboardStatInput) {
  @Field(() => Int)
  id: number;
}
