import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherResolver } from './voucher.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [VoucherResolver, VoucherService, PrismaService],
})
export class VoucherModule {}
