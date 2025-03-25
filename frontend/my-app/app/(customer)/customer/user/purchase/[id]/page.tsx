"use client";

import React, { useState, useEffect } from "react";
import OrderTabs from "@/app/components/purchase/OrderTabs";
import OrderList from "@/app/components/purchase/OrderList";
import EmptyOrder from "@/app/components/purchase/EmptyOrder";

// Import interface từ file OrderList hoặc định nghĩa lại theo đúng cấu trúc
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
}

interface Order {
  id: string;
  shopName: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const OrderPage = () => {
  // Trạng thái để lưu tab hiện tại đang được chọn
  const [activeTab, setActiveTab] = useState<string>("all");

  // Demo data (call api ở đây)
  const [orders, setOrders] = useState<Order[]>([]);

  // Giả lập việc tải dữ liệu khi component được mount
  useEffect(() => {
    // đây sẽ là một API call
    const fetchOrders = () => {
      // Giả lập dữ liệu đơn hàng với một vài mẫu
      const demoOrders: Order[] = [
        // Có thể thêm dữ liệu mẫu
      ];
      setOrders(demoOrders);
    };

    fetchOrders();
  }, []);

  // Hàm xử lý khi chuyển tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Trong thực tế sẽ gọi API để lấy đơn hàng theo trạng thái
    fetchOrdersByStatus(tabId);
  };

  // Hàm lấy đơn hàng theo trạng thái
  const fetchOrdersByStatus = (status: string) => {
    // Giả lập API call
    console.log(`Fetching orders for status: ${status}`);
    const filteredOrders: Order[] = [];
    setOrders(filteredOrders);
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      {/* Tab chọn trạng thái đơn hàng */}
      <OrderTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Danh sách đơn hàng */}
      {orders && orders.length > 0 ? (
        <OrderList orders={orders} />
      ) : (
        <EmptyOrder />
      )}
    </div>
  );
};

export default OrderPage;
