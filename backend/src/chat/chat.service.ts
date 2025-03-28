import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';
import { SenderType } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Get all chats for a user
  async findAllChatsByUser(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        id_user: userId,
      },
      include: {
        shop: true,
        messages: {
          orderBy: {
            sent_at: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        last_message_at: 'desc',
      },
    });
  }

  // Get all chats for a shop
  async findAllChatsByShop(shopId: string) {
    return this.prisma.chat.findMany({
      where: {
        shop_id: shopId,
      },
      include: {
        user: true,
        messages: {
          orderBy: {
            sent_at: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        last_message_at: 'desc',
      },
    });
  }

  // Get chat by ID
  async findChatById(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { chat_id: chatId },
      include: {
        user: true,
        shop: true,
        messages: {
          orderBy: {
            sent_at: 'asc',
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    return chat;
  }

  // Create a new chat or return existing one
  async createChat(createChatDto: CreateChatDto) {
    // Check if user is trying to chat with their own shop
    const shop = await this.prisma.shop.findUnique({
      where: { shop_id: createChatDto.shop_id },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${createChatDto.shop_id} not found`);
    }

    if (shop.id_user === createChatDto.id_user) {
      throw new BadRequestException('Cannot create chat with your own shop');
    }

    // Check if chat already exists
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        id_user: createChatDto.id_user,
        shop_id: createChatDto.shop_id,
      },
      include: {
        messages: {
          orderBy: {
            sent_at: 'asc',
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    return this.prisma.chat.create({
      data: {
        chat_id: uuidv4(),
        id_user: createChatDto.id_user,
        shop_id: createChatDto.shop_id,
        create_at: new Date(),
        update_at: new Date(),
      },
    });
  }

  // Send a message
  async sendMessage(sendMessageDto: SendMessageDto) {
    // Check if chat exists
    const chat = await this.prisma.chat.findUnique({
      where: { chat_id: sendMessageDto.chat_id },
      include: {
        shop: true
      }
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${sendMessageDto.chat_id} not found`);
    }

    // Validate sender
    const isUser = chat.id_user === sendMessageDto.sender_id;
    const isShopOwner = chat.shop?.id_user === sendMessageDto.sender_id;

    if (!isUser && !isShopOwner) {
      throw new BadRequestException('User not authorized to send message in this chat');
    }

    // Update chat's last message time
    await this.prisma.chat.update({
      where: { chat_id: sendMessageDto.chat_id },
      data: {
        last_message_at: new Date(),
        update_at: new Date(),
      },
    });

    // Create message - determine sender_type based on sender's role
    return this.prisma.chat_Message.create({
      data: {
        chat_id: sendMessageDto.chat_id,
        sender_id: sendMessageDto.sender_id,
        sender_type: isShopOwner ? 'shop' : 'user',
        message: sendMessageDto.message,
        sent_at: new Date(),
        is_read: false,
      },
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { chat_id: chatId },
      include: { shop: true },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    // Check if the user is part of this chat
    const isUser = chat.id_user === userId;
    const isShopOwner = chat.shop?.id_user === userId;

    if (!isUser && !isShopOwner) {
      throw new BadRequestException('User not authorized to access this chat');
    }

    // Determine which messages to mark as read
    const senderType = isUser ? SenderType.SHOP : SenderType.USER;

    return this.prisma.chat_Message.updateMany({
      where: {
        chat_id: chatId,
        sender_type: senderType,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  }
} 