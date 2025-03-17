"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import OrderDetail from "@/app/components/purchase/OrderDetail";

// Demo data
const sampleOrder = {
  id: "ABC123456789",
  shopName: "Shop ABC",
  status: "delivering",
  statusHistory: [
    { status: "pending", timestamp: "2025-03-15T08:00:00Z" },
    { status: "shipping", timestamp: "2025-03-15T10:30:00Z" },
    { status: "delivering", timestamp: "2025-03-16T09:15:00Z" },
  ],
  items: [
    {
      id: "item1",
      name: "Áo thun cotton nam nữ form rộng",
      price: 150000,
      quantity: 2,
      image: "/placeholder/product1.jpg",
      variation: "Trắng, XL",
    },
    {
      id: "item2",
      name: "Quần jean nam baggy",
      price: 350000,
      quantity: 1,
      image: "/placeholder/product2.jpg",
      variation: "Xanh đậm, 32",
    },
  ],
  totalAmount: 650000,
  shippingFee: 30000,
  discount: 50000,
  paymentMethod: "Thanh toán khi nhận hàng (COD)",
  createdAt: "2025-03-15T08:00:00Z",
  shippingAddress: {
    recipient: "Nguyễn Văn A",
    phone: "0987654321",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh",
  },
};

const OrderDetailPage = () => {
  const params = useParams();
  const [order, setOrder] = useState(sampleOrder);
  const [isLoading, setIsLoading] = useState(true);

  // gọi API để lấy chi tiết đơn hàng
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        // Tạm sử dụng dữ liệu mẫu

        // Simulate API call
        setTimeout(() => {
          // Simulate order data from API
          const orderId = Array.isArray(params.id)
            ? params.id[0]
            : String(params.id);

          // dùng dữ liệu api ở đây
          const mockOrder = {
            ...sampleOrder,
            id: orderId || sampleOrder.id,
          };

          setOrder(mockOrder);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng</h1>
      <OrderDetail order={order} />
    </div>
  );
};

export default OrderDetailPage;
