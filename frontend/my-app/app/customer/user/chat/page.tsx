"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_BY_ID } from "@/graphql/queries";
import { SEND_MESSAGE, MARK_MESSAGES_AS_READ } from "@/graphql/mutations";
import { 
  Paper, Typography, Box, TextField, Button, 
  Avatar, CircularProgress, IconButton 
} from "@mui/material";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
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

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { loading, error, data, refetch } = useQuery(GET_CHAT_BY_ID, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "network-only",
  });

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessage('');
      refetch();
    },
    onError: (error) => {
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.message.includes("Invalid user sender")) {
        errorMessage = "You're not authorized to send messages in this chat.";
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
    if (chatId && isSignedIn) {
      markMessagesAsRead({
        variables: { chatId }
      });
    }
  }, [chatId, isSignedIn, markMessagesAsRead]);

  if (!isSignedIn) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Please sign in to view your chats</Typography>
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

  if (!chatId) {
    return (
      <Box p={4} textAlign="center">
        <MessageCircle size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>Select a chat to start messaging</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">Error loading chat: {error.message}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => router.back()}
          startIcon={<ArrowLeft />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const chat = data?.getChatById;
  if (!chat) {
    return (
      <Box p={4} textAlign="center">
        <Typography>Chat not found</Typography>
        <Button 
          variant="outlined" 
          onClick={() => router.back()}
          startIcon={<ArrowLeft />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) return;

    try {
      await sendMessage({
        variables: {
          sendMessageInput: {
            chat_id: chatId,
            sender_type: SenderType.USER,
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

  return (
    <Box sx={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      {/* Chat header */}
      <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft />
        </IconButton>
        <Avatar src={chat.shop?.logo || "/logo/avt-capy.png"} />
        <Typography variant="h6">{chat.shop?.shop_name}</Typography>
      </Paper>
      
      {/* Chat messages */}
      <Box sx={{ 
        flex: 1, 
        overflowY: "auto", 
        p: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 2,
        bgcolor: "#f5f5f5"
      }}>
        {chat.messages?.length === 0 ? (
          <Box textAlign="center" my={4}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          chat.messages?.map((msg: ChatMessage) => {
            const isUser = msg.sender_type === SenderType.USER;
            
            return (
              <Box 
                key={msg.message_id} 
                sx={{ 
                  display: "flex", 
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  mb: 1
                }}
              >
                <Box sx={{ maxWidth: "70%" }}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: isUser ? "#1976d2" : "white",
                      color: isUser ? "white" : "text.primary"
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        mt: 0.5,
                        textAlign: "right",
                        color: isUser ? "rgba(255,255,255,0.7)" : "text.secondary"
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
      <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
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
          color="primary"
          disabled={!message.trim() || sendingMessage}
          onClick={handleSendMessage}
          startIcon={<Send />}
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
} 