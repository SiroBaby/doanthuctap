"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleChatCreated: (chatId: string) => void;
  setHandleChatCreated: (handler: (chatId: string) => void) => void;
}

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  setIsOpen: () => {},
  handleChatCreated: () => {},
  setHandleChatCreated: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [handleChatCreated, setHandleChatCreated] = useState<(chatId: string) => void>(() => () => {});

  // Reset chat state when component mounts or unmounts
  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Route changed, closing chat');
      setIsOpen(false);
    };

    // Close chat on mount ONLY if it wasn't opened by clicking "Chat with seller"
    if (!sessionStorage.getItem('openChatFromButton')) {
      console.log('ChatProvider mounted, ensuring chat is closed');
      setIsOpen(false);
    } else {
      console.log('ChatProvider mounted, chat was opened from button');
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      sessionStorage.removeItem('openChatFromButton');
      setIsOpen(false);
    };
  }, []);

  const handleSetIsOpen = (value: boolean) => {
    console.log('Setting chat open state:', value);
    if (value) {
      // Nếu đang mở chat, kiểm tra xem có phải từ nút "Chat with seller" không
      const isFromButton = sessionStorage.getItem('openChatFromButton');
      console.log('Opening chat, isFromButton:', isFromButton);
    } else {
      // Nếu đóng chat, xóa trạng thái
      sessionStorage.removeItem('openChatFromButton');
    }
    setIsOpen(value);
  };

  const value = {
    isOpen,
    setIsOpen: handleSetIsOpen,
    handleChatCreated,
    setHandleChatCreated,
  };

  console.log('ChatContext current state:', { isOpen });

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 