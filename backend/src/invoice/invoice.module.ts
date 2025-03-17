import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [InvoiceResolver, InvoiceService, PrismaService],
})
export class InvoiceModule {} 