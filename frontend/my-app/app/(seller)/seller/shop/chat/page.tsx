"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_BY_ID, GET_SHOP_CHATS, GET_SHOP_ID_BY_USER_ID } from "@/graphql/queries";
import { SEND_MESSAGE, MARK_MESSAGES_AS_READ } from "@/graphql/mutations";
import { 
  Paper, Typography, Box, TextField, Button, 
  Avatar, CircularProgress, List, ListItem, 
  ListItemText, ListItemAvatar,
  Grid
} from "@mui/material";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

enum SenderType {
  USER = 'user',
  SHOP = 'shop'
}

interface ChatMessage {
  message_id: number;
  chat_id: string;
  sender_type: SenderType;
  sender_id: string;
  message: string;
  sent_at: string;
  is_read: boolean;
}

interface UserChat {
  chat_id: string;
  id_user: string;
  shop_id: string;
  last_message_at: string | null;
  user: {
    id_user: string;
    user_name: string;
    avatar: string | null;
  };
  messages: ChatMessage[];
}

export default function SellerChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatId);
  const [shopId, setShopId] = useState<string | null>(null);

  // Get shop ID for current user
  const { loading: loadingShopId, error: shopIdError } = useQuery(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: user?.id },
    skip: !user?.id,
    onCompleted: (data) => {
      if (data?.getShopIdByUserId?.shop_id) {
        setShopId(data.getShopIdByUserId.shop_id);
      }
    }
  });

  // Get shop chats
  const { loading: loadingChats, error: chatsError, data: chatsData, refetch: refetchChats } = useQuery(GET_SHOP_CHATS, {
    variables: { shopId },
    skip: !shopId,
    fetchPolicy: "network-only",
  });

  // Get selected chat details
  const { loading, error, data, refetch } = useQuery(GET_CHAT_BY_ID, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
    fetchPolicy: "network-only",
  });

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessage('');
      refetch();
      refetchChats();
    },
    onError: (error) => {
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.message.includes("Invalid shop sender")) {
        errorMessage = "You're not authorized to send messages from this shop.";
      } else if (error.networkError) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      console.error("Message error:", error);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-center',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  });

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ, {
    onError: (error) => {
      console.error("Failed to mark messages as read:", error);
    }
  });

  useEffect(() => {
    // Scroll to bottom when messages load or new messages are added
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.getChatById?.messages]);

  useEffect(() => {
    // Mark messages as read when chat loads
    if (selectedChatId && isSignedIn) {
      markMessagesAsRead({
        variables: { chatId: selectedChatId }
      });
    }
  }, [selectedChatId, isSignedIn, markMessagesAsRead]);

  useEffect(() => {
    setSelectedChatId(chatId);
  }, [chatId]);

  if (!isSignedIn) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Please sign in to view shop chats</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => router.push('/sign-in')}
          sx={{ mt: 2 }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  if (loadingShopId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (shopIdError) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">Error loading shop information</Typography>
      </Box>
    );
  }

  if (!shopId) {
    return (
      <Box p={4} textAlign="center">
        <Typography>No shop found. You need to have a shop to use this feature.</Typography>
      </Box>
    );
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(`/seller/shop/chat?chatId=${chatId}`);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !selectedChatId) return;

    try {
      await sendMessage({
        variables: {
          sendMessageInput: {
            chat_id: selectedChatId,
            sender_type: SenderType.SHOP,
            sender_id: user.id,
            message: message.trim()
          }
        }
      });
    } catch {
      // Error is handled in onError callback
    }
  };

  const formatMessageTime = (time: string) => {
    return format(new Date(time), 'MMM d, h:mm a');
  };

  const renderChatList = () => {
    if (loadingChats) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (chatsError) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="error">Failed to load chats</Typography>
        </Box>
      );
    }

    if (!chatsData?.getShopChats || chatsData.getShopChats.length === 0) {
      return (
        <Box p={3} textAlign="center">
          <Typography>No customer chats yet</Typography>
        </Box>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
        {chatsData.getShopChats.map((chat: UserChat) => (
          <ListItem
            key={chat.chat_id}
            onClick={() => handleChatSelect(chat.chat_id)}
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedChatId === chat.chat_id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <ListItemAvatar>
              <Avatar alt={chat.user.user_name} src={chat.user.avatar || "/logo/avt-capy.png"} />
            </ListItemAvatar>
            <ListItemText
              primary={chat.user.user_name}
              secondary={
                chat.messages && chat.messages.length > 0 
                  ? chat.messages[0].message.substring(0, 30) + (chat.messages[0].message.length > 30 ? '...' : '')
                  : "No messages yet"
              }
            />
            <Typography variant="caption" color="text.secondary">
              {chat.last_message_at ? formatMessageTime(chat.last_message_at) : ''}
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderChatArea = () => {
    if (!selectedChatId) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <MessageCircle size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>Select a conversation to start messaging</Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={4} textAlign="center">
          <Typography color="error">Error loading chat: {error.message}</Typography>
        </Box>
      );
    }

    const chat = data?.getChatById;
    if (!chat) {
      return (
        <Box p={4} textAlign="center">
          <Typography>Chat not found</Typography>
        </Box>
      );
    }

    return (
      <Box display="flex" flexDirection="column" height="100%">
        {/* Chat header */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2 }} src={chat.user?.avatar || "/logo/avt-capy.png"} />
            <Typography variant="h6">{chat.user?.user_name}</Typography>
          </Box>
        </Paper>
        
        {/* Messages area */}
        <Box
          flex={1}
          p={2}
          sx={{
            overflowY: 'auto',
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {chat.messages?.length === 0 ? (
            <Box textAlign="center" my={4}>
              <Typography color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            chat.messages?.map((msg: ChatMessage) => {
              const isShop = msg.sender_type === SenderType.SHOP;
              
              return (
                <Box 
                  key={msg.message_id} 
                  sx={{ 
                    display: "flex", 
                    justifyContent: isShop ? "flex-end" : "flex-start",
                    mb: 1
                  }}
                >
                  <Box sx={{ maxWidth: "70%" }}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: isShop ? "#1976d2" : "white",
                        color: isShop ? "white" : "text.primary"
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: "block", 
                          mt: 0.5,
                          textAlign: "right",
                          color: isShop ? "rgba(255,255,255,0.7)" : "text.secondary"
                        }}
                      >
                        {formatMessageTime(msg.sent_at)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messageEndRef} />
        </Box>
        
        {/* Message input */}
        <Paper sx={{ p: 2, display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            disabled={!message.trim() || sendingMessage}
            onClick={handleSendMessage}
            startIcon={<Send />}
          >
            Send
          </Button>
        </Paper>
      </Box>
    );
  };

  return (
    <Grid container spacing={2} sx={{ height: "calc(100vh - 100px)" }}>
      {/* Chat list sidebar */}
      <Grid item xs={12} md={4} lg={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
          Customer Conversations
        </Typography>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {renderChatList()}
        </Box>
      </Grid>
      
      {/* Chat area */}
      <Grid item xs={12} md={8} lg={9} sx={{ height: "100%" }}>
        {renderChatArea()}
      </Grid>
    </Grid>
  );
} 