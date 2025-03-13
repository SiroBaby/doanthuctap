"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductOrderInfoProps {
  productName: string;
  brandName: string;
  price: number;
  colors: string[];
  sizes: string[];
}

const ProductOrderInfo: React.FC<ProductOrderInfoProps> = ({
  productName,
  brandName,
  price,
  colors,
  sizes,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[2]);

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const toggleColorDropdown = () => {
    setIsColorDropdownOpen(!isColorDropdownOpen);
  };

  const toggleSizeDropdown = () => {
    setIsSizeDropdownOpen(!isSizeDropdownOpen);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString("vi-VN");
  };

  // Thêm các hàm xử lý sự kiện trực tiếp trong component
  const handleAddToCart = () => {
    console.log("Product added to cart");
    console.log(
      `Added ${quantity} items of ${productName}, color: ${selectedColor}, size: ${selectedSize}`
    );
    // Thêm logic xử lý giỏ hàng ở đây
  };

  const handleBuyNow = () => {
    console.log("Proceeding to checkout");
    console.log(
      `Buying ${quantity} items of ${productName}, color: ${selectedColor}, size: ${selectedSize}`
    );
    // Thêm logic xử lý mua ngay ở đây
  };

  return (
    <div className="flex flex-col w-full max-w-md">
      <h1 className="text-lg font-medium">{productName}</h1>
      <div className="text-sm text-gray-600">Từ {brandName}</div>

      <div className="mt-4 text-xl font-semibold text-blue-400">
        {formatPrice(price)}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Màu sắc</div>
          <button onClick={toggleColorDropdown} className="flex items-center">
            {isColorDropdownOpen ? (
              <Image
                src="/icon/left-arrow.png"
                alt="arrow"
                width={160}
                height={160}
                className="object-contain"
              />
            ) : (
              <Image
                src="/icon/right-arrow.png"
                alt="arrow"
                width={160}
                height={160}
                className="object-contain"
              />
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`py-2 px-4 text-center border rounded ${
                selectedColor === color
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedColor(color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Kích cỡ</div>
          <button onClick={toggleSizeDropdown} className="flex items-center">
            {isSizeDropdownOpen ? (
              <Image
                src="/logo/left-arrow.png"
                alt="arrow"
                width={160}
                height={160}
                className="object-contain"
              />
            ) : (
              <Image
                src="/logo/right-arrow.png"
                alt="arrow"
                width={160}
                height={160}
                className="object-contain"
              />
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className={`py-2 px-4 text-center border rounded ${
                selectedSize === size
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="font-medium mb-2">Số lượng</div>
        <div className="flex items-center">
          <button
            onClick={decreaseQuantity}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
          >
            -
          </button>
          <div className="h-8 w-12 flex items-center justify-center border-t border-b border-gray-300">
            {quantity}
          </div>
          <button
            onClick={increaseQuantity}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-2 px-4 bg-blue-100 text-blue-600 rounded"
        >
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-2 px-4 bg-yellow-400 text-black rounded"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
};

export default ProductOrderInfo;
