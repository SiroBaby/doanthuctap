"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@apollo/client";
import { CREATE_INVOICE } from "@/graphql/mutations";
import PaymentForm, { OrderData } from "@/app/components/purchase/PaymentForm";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/[id]/page";
import OrderSummary from "@/app/components/purchase/OrderSummary";
import { toast } from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  
  // Set up the create invoice mutation
  const [createInvoice] = useMutation(CREATE_INVOICE);

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

    if (!userId) {
      toast.error("Bạn cần đăng nhập để đặt hàng");
      return false;
    }

    try {
      // Hiển thị loading toast
      const loadingToast = toast.loading("Đang xử lý đơn hàng...");
      
      // Group items by shop
      const itemsByShop = cartItems.reduce((groups, item) => {
        const key = item.shopId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      }, {} as Record<string, CartItem[]>);
      
      // Process each shop's items as a separate invoice
      const invoicePromises = Object.entries(itemsByShop).map(([shopId, items]) => {
        const shopSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Convert cart items to invoice product format
        const invoiceProducts = items.map(item => ({
          product_variation_id: parseInt(item.productId, 10),
          product_name: item.name,
          variation_name: item.variation || "Default",
          price: item.price,
          quantity: item.quantity,
          discount_percent: item.originalPrice > 0 ? 
            ((item.originalPrice - item.price) / item.originalPrice) * 100 : 0
        }));
        
        // Create payload for the API
        const invoiceInput = {
          user_id: userId,
          shop_id: shopId,
          payment_method: orderData.paymentMethod.toUpperCase(), // Convert to uppercase for backend
          shipping_address_id: parseInt(orderData.shippingAddress.address.split('-')[0] || "0", 10) || null,
          products: invoiceProducts,
          total_amount: shopSubtotal,
          shipping_fee: shippingFee / Object.keys(itemsByShop).length, // Divide shipping fee among shops
          voucher_storage_id: null // No voucher for now
        };
        
        return createInvoice({
          variables: {
            createInvoiceInput: invoiceInput
          }
        });
      });
      
      // Wait for all invoices to be created
      await Promise.all(invoicePromises);
      
      // Xóa dữ liệu session sau khi đặt hàng thành công
      sessionStorage.removeItem('checkoutData');
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      toast.success("Đặt hàng thành công!");

      // Sau khi tạo đơn hàng thành công, chuyển hướng đến trang đơn hàng của người dùng
      router.push("/customer/user/purchase");

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
