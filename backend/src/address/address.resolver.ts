import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { PaginationInput } from '../common/dto/pagination.input';
import AddressPagination from './entities/addresspagination.entity';
import { AddressByUserId } from './entities/addressbyuserid.entity';
@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) { }

  @Mutation(() => Address)
  createAddress(@Args('createAddressInput') createAddressInput: CreateAddressInput) {
    return this.addressService.create(createAddressInput);
  }

  @Query(() => AddressByUserId, { name: 'addressByUserId' })
  addressByUserId(@Args('id', { type: () => String }) id: string) {
    return this.addressService.addressByUserId(id);
  }

  @Query(() => AddressPagination, { name: 'addresss' })
  findAll(@Args('addresss', { type: () => PaginationInput }) paginationArgs: PaginationInput) {
    return this.addressService.findAll(paginationArgs);
  }

  @Query(() => Address, { name: 'address' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.findOne(id);
  }

  @Mutation(() => Address)
  updateAddress(@Args('updateAddressInput') updateAddressInput: UpdateAddressInput) {
    return this.addressService.update(updateAddressInput.address_id, updateAddressInput);
  }

  @Mutation(() => Address)
  removeAddress(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.remove(id);
  }
}
