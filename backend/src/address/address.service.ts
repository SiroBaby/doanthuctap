import { Injectable } from '@nestjs/common';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) { }

  create(createAddressInput: CreateAddressInput) {
    return this.prisma.address.create({
      data: createAddressInput,
    });
  }

  async findAll() {
    return await this.prisma.address.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.address.findUnique({
      where: {
        address_id: id,
      },
    });
  }

  update(id: number, updateAddressInput: UpdateAddressInput) {
    return this.prisma.address.update({
      where: { address_id: id },
      data: updateAddressInput,
    });
  }

  remove(id: number) {
    return this.prisma.address.delete({
      where: { address_id: id },
    });
  }
}
