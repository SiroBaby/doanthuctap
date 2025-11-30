import { Module } from '@nestjs/common';
import { VoucherStorageService } from './voucher-storage.service';
import { VoucherStorageResolver } from './voucher-storage.resolver';
import { PrismaService } from '../prisma.service';
@Module({
  providers: [VoucherStorageResolver, VoucherStorageService, PrismaService],
})
export class VoucherStorageModule { }
