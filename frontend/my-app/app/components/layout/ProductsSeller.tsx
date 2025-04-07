"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";
import { gql, useMutation, useQuery } from "@apollo/client";
import { GET_LATEST_PRODUCTS_BY_SHOP_ID } from "@/graphql/queries";
import ProductCard from "./ProductCard";
import { CircularProgress } from "@mui/material";

interface ProductsSellerProps {
  sellerName: string;
  sellerAvatar: string;
  sellerShopUrl: string;
  shopId: string;
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

interface ProductImage {
  image_url: string;
  is_thumbnail: boolean;
}

interface ProductVariation {
  base_price: number;
  percent_discount: number;
}

interface Product {
  product_id: number;
  product_name: string;
  brand: string;
  status: string;
  product_images: ProductImage[];
  product_variations: ProductVariation[];
}

interface LatestProductsData {
  getProductsByShopId: {
    data: Product[];
  };
}

const ProductsSeller: React.FC<ProductsSellerProps> = ({
  sellerName,
  sellerAvatar,
  sellerShopUrl,
  shopId,
}) => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products">("products");
  const { isConnected } = useSocket();
  const { handleChatCreated, setIsOpen } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch 5 latest products from the shop
  const { data: latestProductsData, loading: productsLoading } = useQuery<LatestProductsData>(
    GET_LATEST_PRODUCTS_BY_SHOP_ID,
    {
      variables: { id: shopId, limit: 5 },
      skip: !shopId,
    }
  );

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

  const handleChatClick = async () => {
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

  const handleTabClick = (tab: "products") => {
    setActiveTab(tab);
  };

  // Render product grid for the shop
  const renderProducts = () => {
    if (productsLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <CircularProgress size={40} />
        </div>
      );
    }

    const products = latestProductsData?.getProductsByShopId?.data || [];

    if (products.length === 0) {
      return (
        <div className="text-gray-500 text-sm text-center py-5">
          Cửa hàng này chưa có sản phẩm nào.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Thông tin người bán */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={sellerAvatar}
              alt={sellerName}
              fill
              className="object-cover"
            />
          </div>
          <span className="font-medium text-gray-800">{sellerName}</span>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2">
          <button
            onClick={handleChatClick}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium 
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
          >
            {isLoading ? "Đang kết nối..." : "Chat ngay"}
          </button>
          <Link
            href={sellerShopUrl}
            className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-md text-sm font-medium"
          >
            Xem shop
          </Link>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            className={`pb-2 ${
              activeTab === "products"
                ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick("products")}
          >
            Sản phẩm
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {renderProducts()}
      </div>
    </div>
  );
};

export default ProductsSeller;
