import React from "react";
import OrderCard from "./OrderCard";

interface Order {
  id: string;
  shopName: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
}

interface OrderListProps {
  orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrderList;
