import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { PrismaService } from '../prisma.service';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatResolver, ChatService, PrismaService, ChatGateway],
})
export class ChatModule {} 