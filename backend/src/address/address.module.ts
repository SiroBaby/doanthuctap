import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResolver } from './address.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [AddressResolver, AddressService, PrismaService],
})
export class AddressModule {}
