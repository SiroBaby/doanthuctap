"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  product_images: ProductImage[];
  product_variations: ProductVariation[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Get price information from the first variation
  const variation = product.product_variations[0] || {};
  const originalPrice = variation.base_price;
  const discountPercent = variation.percent_discount || 0;
  const discountPrice = originalPrice - originalPrice * (discountPercent / 100);
  const isDiscounted = discountPercent > 0;

  // Get image URL (thumbnail or first image) with fallback
  const thumbnailImage = product.product_images?.find(
    (img) => img?.is_thumbnail
  );
  const fallbackImageUrl = "/icon/null.png"; // Default fallback image
  const imageUrl =
    thumbnailImage?.image_url ||
    product.product_images?.[0]?.image_url ||
    fallbackImageUrl;

  return (
    <Link href={`/customer/product/${product.product_id}`}>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden max-w-xs transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
        onMouseLeave={() => {
          setIsButtonPressed(false);
        }}
      >
        <div className="relative h-25">
          <Image
            src={imageUrl}
            width={200}
            height={200}
            alt={product.product_name || "Product image"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative p-3 h-24">
          <p className="text-gray-800 font-medium">{product.product_name}</p>
          {isDiscounted ? (
            <>
              <p className="text-gray-500 line-through font-bold mt-1">
                {originalPrice.toLocaleString()} VNĐ
              </p>
              <p className="text-blue-500 font-bold mt-1">
                {discountPrice.toLocaleString()} VNĐ
              </p>
            </>
          ) : (
            <p className="text-blue-500 font-bold mt-1">
              {originalPrice.toLocaleString()} VNĐ
            </p>
          )}

          <button
            className={`absolute bottom-7 right-5 bg-button-shopping rounded-full p-3
                      transition-all duration-200 ease-in-out
                      ${
                        isButtonPressed
                          ? "scale-90 shadow-inner"
                          : "hover:scale-110 hover:shadow-lg"
                      }`}
            aria-label="Thêm vào giỏ hàng"
            onMouseDown={() => setIsButtonPressed(true)}
            onMouseUp={() => setIsButtonPressed(false)}
            onMouseLeave={() => setIsButtonPressed(false)}
          >
            <Image
              src="/icon/shopping-b.png"
              width={30}
              height={30}
              alt="shopping"
              className="transition-transform duration-200"
            />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
