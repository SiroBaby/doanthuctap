"use client";

import { Button } from "@mui/material";
import { MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";

interface ChatButtonProps {
  shopId: string;
  className?: string;
}

interface CreateChatResponse {
  createChat: {
    chat_id: string;
    id_user: string;
    shop_id: string;
    last_message_at: string;
    create_at: string;
    update_at: string;
  };
}

interface CreateChatVariables {
  createChatInput: {
    id_user: string;
    shop_id: string;
  };
}

export default function ChatButton({ shopId, className }: ChatButtonProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useSocket();
  const { handleChatCreated, setIsOpen } = useChat();

  const CREATE_CHAT = gql`
    mutation CreateChat($createChatInput: CreateChatDto!) {
      createChat(createChatInput: $createChatInput) {
        chat_id
        id_user
        shop_id
        last_message_at
        create_at
        update_at
      }
    }
  `;

  const [createChat] = useMutation<CreateChatResponse, CreateChatVariables>(CREATE_CHAT, {
    onCompleted: (data) => {
      setIsLoading(false);
      console.log('Chat created successfully, opening chat...');
      sessionStorage.setItem('openChatFromButton', 'true');
      setIsOpen(true);
      handleChatCreated(data.createChat.chat_id);
    },
    onError: (error) => {
      setIsLoading(false);
      let errorMessage = "Could not connect to chat. Please try again.";
      
      if (error.message.includes("Cannot create chat with your own shop")) {
        errorMessage = "You cannot chat with your own shop.";
      }
      
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-center',
      });
    },
  });

  const handleClick = async () => {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to chat with the seller", {
        duration: 3000,
        position: 'top-center',
      });
      router.push("/sign-in");
      return;
    }
    
    if (!isConnected) {
      toast.error("Chat service is currently offline. Please try again later.", {
        duration: 3000,
        position: 'bottom-center',
      });
      return;
    }

    try {
      setIsLoading(true);
      await createChat({
        variables: {
          createChatInput: {
            id_user: user.id,
            shop_id: shopId,
          },
        },
      });
    } catch {
      setIsLoading(false);
      toast.error("Failed to connect. Please try again.", {
        duration: 3000,
        position: 'bottom-center',
      });
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<MessageCircle />}
      onClick={handleClick}
      disabled={isLoading || !isSignedIn}
      className={className}
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#f0f7ff',
        },
      }}
    >
      {isLoading ? "Connecting..." : "Chat with seller"}
    </Button>
  );
} 