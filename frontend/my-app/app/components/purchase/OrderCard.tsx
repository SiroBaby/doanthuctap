import React from "react";
import Image from "next/image";
import Link from "next/link";

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

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  // Map trạng thái đơn hàng (có thể đổi theo dtb)
  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      pending: { text: "Chờ thanh toán", color: "text-yellow-600" },
      shipping: { text: "Đang vận chuyển", color: "text-blue-600" },
      delivering: { text: "Đang giao hàng", color: "text-blue-600" },
      completed: { text: "Hoàn thành", color: "text-green-600" },
      cancelled: { text: "Đã hủy", color: "text-red-600" },
      returned: { text: "Trả hàng/Hoàn tiền", color: "text-gray-600" },
    };

    return (
      statusMap[status] || { text: "Không xác định", color: "text-gray-600" }
    );
  };

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <div className="flex items-center">
          <h3 className="font-medium">{order.shopName}</h3>
        </div>
        <div className={`${statusDisplay.color} font-medium`}>
          {statusDisplay.text}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="p-4 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center py-2">
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="ml-4 flex-grow">
              <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
              {item.variation && (
                <p className="text-xs text-gray-500">
                  Phân loại: {item.variation}
                </p>
              )}
              <p className="text-xs text-gray-500">x{item.quantity}</p>
            </div>
            <div className="text-custom-red font-medium">
              ₫{item.price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Phần tổng tiền */}
      <div className="border-t p-4 flex justify-between items-center">
        <div className="text-gray-500 text-sm">
          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">Tổng tiền:</span>
          <span className="text-custom-red font-medium text-lg">
            ₫{order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Phần footer với các action */}
      <div className="border-t p-4 flex justify-end space-x-3">
        <Link
          href={`/customer/user/order/${order.id}`}
          className="px-4 py-2 border border-custom-red text-custom-red text-sm rounded hover:bg-red-50 transition-colors"
        >
          Xem chi tiết
        </Link>
        {order.status === "completed" && (
          <button className="px-4 py-2 bg-custom-red text-white text-sm rounded hover:bg-red-700 transition-colors">
            Mua lại
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
