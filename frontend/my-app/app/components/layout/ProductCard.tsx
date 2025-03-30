/* eslint-disable @typescript-eslint/no-unused-vars */
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
    <Link href={`/customer/details/product/${product.product_id}`}>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden h-[350px] transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
        onMouseLeave={() => {
          setIsButtonPressed(false);
        }}
      >
        <div className="relative h-[240px] bg-white">
          <Image
            src={imageUrl}
            fill
            alt={product.product_name || "Product image"}
            className="object-contain"
          />
        </div>

        <div className="relative p-3 h-[150px]">
          <p className="text-gray-800 font-medium truncate">
            {product.product_name}
          </p>
          {discountPercent > 0 ? (
            <div className="flex flex-col mt-2">
              <div className="flex items-center gap-2">
                <p className="text-gray-500 line-through text-sm">
                  {originalPrice?.toLocaleString()} VNĐ
                </p>
                <p className="text-white rounded-full bg-red-500 px-2 py-1">
                  {discountPercent * 100}%
                </p>
              </div>
              <p className="text-blue-500 font-bold">
                {(
                  (originalPrice || 0) -
                  (originalPrice || 0) * discountPercent
                ).toLocaleString()}{" "}
                VNĐ
              </p>
            </div>
          ) : (
            <p className="text-blue-500 font-bold mt-2">
              {originalPrice?.toLocaleString()} VNĐ
            </p>
          )}

          {/* <button
            className={`absolute bottom-3 right-3 bg-button-shopping rounded-full p-3
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
          </button> */}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
