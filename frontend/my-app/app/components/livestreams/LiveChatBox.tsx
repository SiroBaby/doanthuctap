"use client";

import React, { useState, useEffect, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";

interface LiveChatBoxProps {
  room: Room | null;
  isConnected: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isAdmin?: boolean;
}

const LiveChatBox: React.FC<LiveChatBoxProps> = ({ room, isConnected }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mô phỏng tin nhắn ban đầu
  useEffect(() => {
    // Tạo username ngẫu nhiên
    const randomUser = `user_${Math.floor(Math.random() * 10000)}`;
    setUsername(randomUser);
    
    // Demo messages
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        sender: "Shop Capy",
        message: "Chào mừng mọi người đến với buổi livestream hôm nay!",
        timestamp: new Date(Date.now() - 500000),
        isAdmin: true
      },
      {
        id: "2",
        sender: "user_3842",
        message: "Sản phẩm mới có màu gì vậy shop?",
        timestamp: new Date(Date.now() - 400000)
      },
      {
        id: "3",
        sender: "Shop Capy",
        message: "Sản phẩm mới có 3 màu: đen, trắng và xanh navy bạn nhé!",
        timestamp: new Date(Date.now() - 350000),
        isAdmin: true
      },
      {
        id: "4",
        sender: "user_1589",
        message: "Mình đặt 2 cái áo tuần trước rồi, chất lượng rất tốt 👍",
        timestamp: new Date(Date.now() - 200000)
      },
      {
        id: "5",
        sender: "user_7721",
        message: "Có mã giảm giá không shop?",
        timestamp: new Date(Date.now() - 100000)
      }
    ];
    
    setMessages(initialMessages);
    
    // Mô phỏng tin nhắn mới đến liên tục
    const interval = setInterval(() => {
      const users = ["user_4522", "user_8913", "user_2301", "user_6754"];
      const randomMessages = [
        "Sản phẩm này còn hàng không shop?",
        "Đã mua và rất hài lòng! ❤️",
        "Shop ship ra Hà Nội mất bao lâu ạ?",
        "Áo này mặc rộng hay ôm vậy shop?",
        "Mình có thể đổi size không nếu không vừa?",
        "Giảm giá thêm được không shop ơi 😍",
        "Mua 2 cái có được tặng gì không?",
        "Chất vải có dày không ạ?",
        "Màu trong hình giống ngoài thực tế không?",
        "Có freeship không shop?"
      ];
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: users[Math.floor(Math.random() * users.length)],
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, newMessage]);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // If using LiveKit's data channel for chat functionality
  useEffect(() => {
    if (!room || !isConnected) return;
    
    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === "chat") {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: data.sender,
            message: data.message,
            timestamp: new Date(),
            isAdmin: data.isAdmin
          };
          
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };
    
    // Listen for data messages from LiveKit
    room.on(RoomEvent.DataReceived, handleDataReceived);
    
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, isConnected]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: username,
      message: inputMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    
    // Send message via LiveKit Data Channel if connected
    if (room && isConnected) {
      const data = {
        type: "chat",
        sender: username,
        message: inputMessage.trim()
      };
      
      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(data))
      );
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white text-xs ${
                  msg.isAdmin ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {msg.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline">
                  <span className={`font-medium text-sm ${msg.isAdmin ? "text-red-500" : ""}`}>
                    {msg.sender}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md text-sm transition-colors"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatBox;