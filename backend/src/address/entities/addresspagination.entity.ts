import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Address } from './address.entity';

@ObjectType()
export default class AddressPagination {
    @Field(() => [Address])
    data: Address[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPage: number;
}