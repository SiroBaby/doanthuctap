"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentForm, { OrderData } from "@/app/components/purchase/PaymentForm";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/[id]/page";
import OrderSummary from "@/app/components/purchase/OrderSummary";
import { toast } from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    // Lấy dữ liệu từ sessionStorage
    try {
      const checkoutDataString = sessionStorage.getItem('checkoutData');
      
      if (!checkoutDataString) {
        // Không có dữ liệu trong session, chuyển hướng về giỏ hàng
        toast.error("Không có sản phẩm để thanh toán");
        router.push("/customer/shoppingcart");
        return;
      }
      
      const checkoutData = JSON.parse(checkoutDataString);
      
      if (!checkoutData.items || checkoutData.items.length === 0) {
        // Không có sản phẩm, chuyển hướng về giỏ hàng
        toast.error("Không có sản phẩm để thanh toán");
        router.push("/customer/shoppingcart");
        return;
      }
      
      // Cập nhật state với dữ liệu từ session
      setCartItems(checkoutData.items);
      setSubtotal(checkoutData.subtotal || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu thanh toán:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      router.push("/customer/shoppingcart");
    }
  }, [router]);

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
      // Hiển thị loading toast
      const loadingToast = toast.loading("Đang xử lý đơn hàng...");
      
      // Trong thực tế, sẽ gọi API để tạo đơn hàng
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Xóa dữ liệu session sau khi đặt hàng thành công
      sessionStorage.removeItem('checkoutData');
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      toast.success("Đặt hàng thành công!");

      // Sau khi tạo đơn hàng thành công, chuyển hướng đến trang xác nhận
      router.push("/customer/user/payment");

      // Giả định API trả về thành công
      return true;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi đặt hàng");
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
