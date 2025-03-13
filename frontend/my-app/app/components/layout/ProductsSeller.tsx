"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductsSellerProps {
  sellerName: string;
  sellerAvatar: string;
  sellerShopUrl: string;
}

const ProductsSeller: React.FC<ProductsSellerProps> = ({
  sellerName,
  sellerAvatar,
  sellerShopUrl,
}) => {
  const [activeTab, setActiveTab] = useState<"reviews" | "products">("reviews");

  const handleChatClick = () => {
    console.log("Chat với người bán:", sellerName);
    // Thêm logic để mở hộp thoại chat
  };

  const handleTabClick = (tab: "reviews" | "products") => {
    setActiveTab(tab);
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
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium"
          >
            Chat ngay
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
              activeTab === "reviews"
                ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick("reviews")}
          >
            Đánh giá
          </button>
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
        {activeTab === "reviews" ? (
          <div className="text-gray-500 text-sm">
            {/* Nội dung đánh giá sẽ được hiển thị ở đây */}
            <p>Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            {/* Sản phẩm của người bán sẽ được hiển thị ở đây */}
            <p>Danh sách sản phẩm của người bán sẽ hiển thị ở đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSeller;
