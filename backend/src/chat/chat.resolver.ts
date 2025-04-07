import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { Chat_Message } from './entities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [Chat], { name: 'getUserChats' })
  async getUserChats(@Args('userId') userId: string) {
    return this.chatService.findAllChatsByUser(userId);
  }

  @Query(() => [Chat], { name: 'getShopChats' })
  async getShopChats(@Args('shopId') shopId: string) {
    return this.chatService.findAllChatsByShop(shopId);
  }

  @Query(() => Chat, { name: 'getChatById' })
  async getChatById(@Args('chatId') chatId: string) {
    return this.chatService.findChatById(chatId);
  }

  @Mutation(() => Chat)
  async createChat(
    @Args('createChatInput') createChatDto: CreateChatDto,
  ) {
    return this.chatService.createChat(createChatDto);
  }

  @Mutation(() => Chat_Message)
  async sendMessage(
    @Args('sendMessageInput') sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(sendMessageDto);
  }

  @Mutation(() => Boolean)
  async markMessagesAsRead(
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ) {
    await this.chatService.markMessagesAsRead(chatId, userId);
    return true;
  }
} 