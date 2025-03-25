"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_PRODUCT_TO_CART } from "@/graphql/mutations";
import { GET_CART } from "@/graphql/queries";
import { useAuth } from "@clerk/nextjs";

interface ProductOrderInfoProps {
  productName: string;
  brandName: string;
  shopId: string;
  mainImageUrl: string;
  variations: Array<{
    product_variation_id: number;
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }>;
  onVariationChange?: (variation: {
    product_variation_id: number;
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }) => void; // Callback để thông báo thay đổi
}

const ProductOrderInfo: React.FC<ProductOrderInfoProps> = ({
  productName,
  brandName,
  shopId,
  mainImageUrl,
  variations,
  onVariationChange,
}) => {
  const { userId } = useAuth()
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(variations[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [addProductToCart, { loading: addProductToCartLoading }] = useMutation(ADD_PRODUCT_TO_CART, {
    onCompleted: () => {
      setSuccessMessage("Sản phẩm đã được thêm vào giỏ hàng");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      console.error("Error adding product to cart:", error);
      if (error.message.includes("Product variation not found")) {
        setErrorMessage("Phân loại sản phẩm không tồn tại");
      } else if (error.message.includes("Cart not found")) {
        setErrorMessage("Giỏ hàng không tồn tại");
      } else if (error.message.includes("stock quantity is not enough")) {
        setErrorMessage("Số lượng sản phẩm trong kho không đủ");
      } else {
        setErrorMessage("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng");
      }
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });
  
  const { data: cartData, loading: cartLoading, error: cartError } = useQuery(GET_CART, {
    variables: { id: userId },
  });
  
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleVariationChange = (variation: {
    product_variation_id: number;
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
    return price?.toLocaleString("vi-VN");
  };

  const discountedPrice =
    selectedVariation?.basePrice - ( selectedVariation?.basePrice * selectedVariation?.percentDiscount);

  const handleAddToCart = () => {
    // Kiểm tra số lượng còn trong kho
    if (quantity > selectedVariation.stock_quantity) {
      setErrorMessage(`Chỉ còn ${selectedVariation.stock_quantity} sản phẩm trong kho`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    
    // Kiểm tra giỏ hàng đã được tải chưa
    if (cartLoading) {
      setErrorMessage("Đang tải thông tin giỏ hàng, vui lòng thử lại");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (cartError) {
      setErrorMessage("Không thể tải thông tin giỏ hàng");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (!cartData || !cartData.getcart) {
      setErrorMessage("Giỏ hàng chưa được khởi tạo");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // Thực hiện thêm vào giỏ hàng
    try {
      addProductToCart({ 
        variables: { 
          cart_id: cartData.getcart.cart_id,
          product_variation_id: selectedVariation.product_variation_id,
          quantity: quantity,
          is_selected: false
        }
      });
    } catch (error) {
      console.error("Error in add to cart:", error);
      setErrorMessage("Đã xảy ra lỗi khi thêm vào giỏ hàng");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleBuyNow = () => {
    // Kiểm tra số lượng còn trong kho
    if (quantity > selectedVariation.stock_quantity) {
      setErrorMessage(`Chỉ còn ${selectedVariation.stock_quantity} sản phẩm trong kho`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Kiểm tra người dùng đã đăng nhập chưa
    if (!userId) {
      setErrorMessage("Vui lòng đăng nhập để mua hàng");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Tạo dữ liệu sản phẩm mua ngay
    const product = {
      id: `buy-now-${Date.now()}`, // ID tạm thời cho mục đích mua ngay
      productId: selectedVariation.product_variation_id.toString(),
      name: productName,
      variation: selectedVariation.name,
      price: discountedPrice,
      originalPrice: selectedVariation.basePrice,
      quantity: quantity,
      image: mainImageUrl,
      shopId: shopId,
      shopName: brandName,
      checked: true
    };

    // Chuẩn bị dữ liệu để lưu vào sessionStorage
    const checkoutData = {
      userId: userId,
      shopId: shopId,
      items: [product],
      subtotal: product.price * product.quantity,
      isBuyNow: true
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    // Chuyển hướng đến trang thanh toán
    window.location.href = '/customer/payment';
  };

  return (
    <div className="flex flex-col w-full max-w-md">
      <h1 className="text-lg font-medium">{productName}</h1>
      <div className="text-sm text-gray-600">Từ {brandName}</div>

      {errorMessage && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="mt-4 text-xl font-semibold text-blue-400">
        {formatPrice(discountedPrice)} ₫
      </div>
      <div className="text-sm text-gray-500">
        Giá gốc: <span className="line-through italic">{formatPrice(selectedVariation?.basePrice)} ₫</span>
        {selectedVariation?.percentDiscount > 0 && (
          <> - Giảm: <span className="text-white bg-red-500 rounded-xl px-2">{selectedVariation?.percentDiscount * 100}%</span></>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Kho: <span className="">{selectedVariation?.stock_quantity} sản phẩm</span>
      </div>

      <div className="mt-6">
        <div className="font-medium mb-2">Phân loại</div>
        <div className="grid grid-cols-3 gap-2">
          {variations.map((variation) => (
            <button
              key={variation.name}
              className={`py-2 px-4 text-center border rounded ${
                selectedVariation?.name === variation.name
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
          className="flex-1 py-2 px-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center"
          disabled={addProductToCartLoading}
        >
          {addProductToCartLoading ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Thêm vào giỏ hàng"
          )}
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