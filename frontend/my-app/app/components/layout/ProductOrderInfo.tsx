"use client";

import React, { useState } from "react";

interface ProductOrderInfoProps {
  productName: string;
  brandName: string;
  variations: Array<{
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }>;
  onVariationChange?: (variation: {
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }) => void; // Callback để thông báo thay đổi
}

const ProductOrderInfo: React.FC<ProductOrderInfoProps> = ({
  productName,
  brandName,
  variations,
  onVariationChange,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(variations[0]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleVariationChange = (variation: {
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }) => {
    setSelectedVariation(variation);
    if (onVariationChange) {
      onVariationChange(variation); // Gọi callback để thông báo lên parent
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString("vi-VN");
  };

  const discountedPrice =
    selectedVariation.basePrice - ( selectedVariation.basePrice * selectedVariation.percentDiscount);

  const handleAddToCart = () => {
    console.log(
      `Added ${quantity} items of ${productName}, variation: ${selectedVariation.name}, price: ${discountedPrice}`
    );
  };

  const handleBuyNow = () => {
    console.log(
      `Buying ${quantity} items of ${productName}, variation: ${selectedVariation.name}, price: ${discountedPrice}`
    );
  };

  return (
    <div className="flex flex-col w-full max-w-md">
      <h1 className="text-lg font-medium">{productName}</h1>
      <div className="text-sm text-gray-600">Từ {brandName}</div>

      <div className="mt-4 text-xl font-semibold text-blue-400">
        {formatPrice(discountedPrice)} ₫
      </div>
      <div className="text-sm text-gray-500">
        Giá gốc: <span className="line-through italic">{formatPrice(selectedVariation.basePrice)} ₫</span>
        {selectedVariation.percentDiscount > 0 && (
          <> - Giảm: <span className="text-white bg-red-500 rounded-xl px-2">{selectedVariation.percentDiscount * 100}%</span></>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Kho: <span className="">{selectedVariation.stock_quantity} sản phẩm</span>
      </div>

      <div className="mt-6">
        <div className="font-medium mb-2">Phân loại</div>
        <div className="grid grid-cols-3 gap-2">
          {variations.map((variation) => (
            <button
              key={variation.name}
              className={`py-2 px-4 text-center border rounded ${
                selectedVariation.name === variation.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => handleVariationChange(variation)}
            >
              {variation.name}
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