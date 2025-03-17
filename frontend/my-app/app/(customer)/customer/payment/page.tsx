"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentForm, { OrderData } from "@/app/components/purchase/PaymentForm";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/page";
import OrderSummary from "@/app/components/purchase/OrderSummary";

const Page = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dữ liệu mẫu để test
  const cartItemsMock = [
    {
      id: "item1",
      productId: "p1",
      name: "Áo thun cotton nam nữ form rộng",
      price: 150000,
      originalPrice: 200000,
      quantity: 2,
      image: "/placeholder/product1.jpg",
      variation: "Trắng, XL",
      isSelected: true,
      shopId: "shop1",
      shopName: "Shop ABC",
    },
    {
      id: "item2",
      productId: "p2",
      name: "Quần jean nam baggy",
      price: 350000,
      originalPrice: 350000,
      quantity: 1,
      image: "/placeholder/product2.jpg",
      variation: "Xanh đậm, 32",
      isSelected: true,
      shopId: "shop1",
      shopName: "Shop ABC",
    },
  ];

  useEffect(() => {
    // Simulating API call to fetch selected cart items
    setTimeout(() => {
      // Trong thực tế, chỉ lấy các sản phẩm đã được chọn
      const selectedItems = cartItemsMock.filter((item) => item.isSelected);
      setCartItems(selectedItems);
      setIsLoading(false);
    }, 500);
  }, []);

  // Tính tổng tiền đơn hàng (chưa bao gồm phí vận chuyển)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Phí vận chuyển mẫu (trong thực tế sẽ tính dựa trên địa chỉ và trọng lượng)
  const shippingFee = 30000;

  // Tổng cộng
  const totalAmount = subtotal + shippingFee;

  // Xử lý đặt hàng
  const handlePlaceOrder = async (orderData: OrderData): Promise<boolean> => {
    console.log("Dữ liệu đơn hàng:", orderData);
    console.log("Sản phẩm trong đơn hàng:", cartItems);

    // Mô phỏng gửi dữ liệu lên API
    try {
      // Trong thực tế, sẽ gọi API để tạo đơn hàng
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Sau khi tạo đơn hàng thành công, chuyển hướng đến trang xác nhận
      router.push("/customer/user/payment");

      // Giả định API trả về thành công
      return true;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-red"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    router.push("/customer/shoppingcart");
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg">Không có sản phẩm để thanh toán...</p>
        <p>Đang chuyển hướng về giỏ hàng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PaymentForm
            totalAmount={totalAmount}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
