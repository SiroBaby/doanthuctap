import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { Chat_Message } from './entities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GqlClerkAuthGuard } from '../auth/gql-clerk-auth.guard';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(GqlClerkAuthGuard)
  @Query(() => [Chat], { name: 'getUserChats' })
  async getUserChats(@Context() context) {
    const userId = context.req.user.id;
    return this.chatService.findAllChatsByUser(userId);
  }

  @UseGuards(GqlClerkAuthGuard)
  @Query(() => [Chat], { name: 'getShopChats' })
  async getShopChats(@Args('shopId') shopId: string, @Context() context) {
    return this.chatService.findAllChatsByShop(shopId);
  }

  @UseGuards(GqlClerkAuthGuard)
  @Query(() => Chat, { name: 'getChatById' })
  async getChatById(@Args('chatId') chatId: string) {
    return this.chatService.findChatById(chatId);
  }

  @UseGuards(GqlClerkAuthGuard)
  @Mutation(() => Chat)
  async createChat(
    @Args('createChatInput') createChatDto: CreateChatDto,
    @Context() context,
  ) {
    return this.chatService.createChat(createChatDto);
  }

  @UseGuards(GqlClerkAuthGuard)
  @Mutation(() => Chat_Message)
  async sendMessage(
    @Args('sendMessageInput') sendMessageDto: SendMessageDto,
    @Context() context,
  ) {
    return this.chatService.sendMessage(sendMessageDto);
  }

  @UseGuards(GqlClerkAuthGuard)
  @Mutation(() => Boolean)
  async markMessagesAsRead(
    @Args('chatId') chatId: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    await this.chatService.markMessagesAsRead(chatId, userId);
    return true;
  }
} 