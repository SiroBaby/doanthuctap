import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WebhooksController],
  providers: [PrismaService],
})
export class WebhooksModule {}