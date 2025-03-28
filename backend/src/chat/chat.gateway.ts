import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

interface ChatMessage {
  chatId: string;
  senderId: string;
  message: string;
}

interface JoinChatRoom {
  chatId: string;
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChatRoom')
  handleJoinChatRoom(@MessageBody() data: JoinChatRoom, @ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} joined chat room: ${data.chatId}`);
    client.join(data.chatId);
    return { status: 'success', message: `Joined chat room: ${data.chatId}` };
  }

  @SubscribeMessage('leaveChatRoom')
  handleLeaveChatRoom(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} left chat room: ${data.chatId}`);
    client.leave(data.chatId);
    return { status: 'success', message: `Left chat room: ${data.chatId}` };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: ChatMessage) {
    this.logger.log(`Message received in room ${data.chatId}: ${data.message}`);
    
    try {
      // Lưu tin nhắn vào database
      const savedMessage = await this.chatService.sendMessage({
        chat_id: data.chatId,
        sender_id: data.senderId,
        message: data.message
      });
      
      // Broadcast tin nhắn đến tất cả client trong phòng chat
      this.server.to(data.chatId).emit('newMessage', {
        ...savedMessage,
        chat_id: data.chatId,
        sender_id: data.senderId
      });
      
      return { status: 'success', data: savedMessage };
    } catch (error) {
      this.logger.error('Error saving message:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(@MessageBody() data: { chatId: string, userId: string }) {
    try {
      await this.chatService.markMessagesAsRead(data.chatId, data.userId);
      this.server.to(data.chatId).emit('messagesMarkedAsRead', {
        chatId: data.chatId,
        userId: data.userId
      });
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error marking messages as read:', error);
      return { status: 'error', message: error.message };
    }
  }
} 