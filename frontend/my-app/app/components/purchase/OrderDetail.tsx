import React from "react";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
}

interface OrderAddress {
  recipient: string;
  phone: string;
  address: string;
}

interface OrderDetail {
  id: string;
  shopName: string;
  status: string;
  statusHistory: { status: string; timestamp: string }[];
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: OrderAddress;
}

interface OrderDetailProps {
  order: OrderDetail;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  // Map trạng thái đơn hàng
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Chi tiết đơn hàng</h1>
          <div className={`${statusDisplay.color} font-medium`}>
            {statusDisplay.text}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mã đơn hàng: {order.id} • Ngày đặt:{" "}
          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      {/* Phần địa chỉ nhận hàng */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-3">Địa chỉ nhận hàng</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-medium">{order.shippingAddress.recipient}</p>
          <p className="text-gray-700">{order.shippingAddress.phone}</p>
          <p className="text-gray-700">{order.shippingAddress.address}</p>
        </div>
      </div>

      {/* Phần cửa hàng và sản phẩm */}
      <div className="p-6 border-b">
        <div className="mb-4">
          <h3 className="font-medium">{order.shopName}</h3>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center py-3 border-t">
              <div className="w-20 h-20 relative flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="ml-4 flex-grow">
                <h4 className="font-medium">{item.name}</h4>
                {item.variation && (
                  <p className="text-sm text-gray-500">
                    Phân loại: {item.variation}
                  </p>
                )}
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <div className="text-custom-red font-medium">
                ₫{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần chi tiết thanh toán */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-3">Chi tiết thanh toán</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng tiền hàng</span>
            <span>
              ₫
              {(
                order.totalAmount +
                order.discount -
                order.shippingFee
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span>₫{order.shippingFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giảm giá</span>
            <span>-₫{order.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium text-lg mt-4">
            <span>Tổng thanh toán</span>
            <span className="text-custom-red">
              ₫{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Phần phương thức thanh toán */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-3">Phương thức thanh toán</h2>
        <p>{order.paymentMethod}</p>
      </div>

      {/* Phần lịch sử trạng thái */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-3">Lịch sử đơn hàng</h2>
        <div className="space-y-4">
          {order.statusHistory.map((item, index) => (
            <div key={index} className="flex">
              <div className="mr-4 relative">
                <div className="w-4 h-4 rounded-full bg-custom-red"></div>
                {index < order.statusHistory.length - 1 && (
                  <div className="absolute top-4 bottom-0 left-1/2 w-0.5 -ml-px h-full bg-gray-200"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium">
                  {getStatusDisplay(item.status).text}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 flex justify-end space-x-3">
        <Link
          href="/customer/user/purchase"
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
        >
          Trở lại
        </Link>

        {order.status === "pending" && (
          <button className="px-6 py-2 bg-custom-red text-white font-medium rounded hover:bg-red-700 transition-colors">
            Thanh toán ngay
          </button>
        )}

        {(order.status === "pending" || order.status === "shipping") && (
          <button className="px-6 py-2 border border-custom-red text-custom-red font-medium rounded hover:bg-red-50 transition-colors">
            Hủy đơn hàng
          </button>
        )}

        {order.status === "completed" && (
          <>
            <button className="px-6 py-2 border border-custom-red text-custom-red font-medium rounded hover:bg-red-50 transition-colors">
              Đánh giá
            </button>

            <button className="px-6 py-2 bg-custom-red text-white font-medium rounded hover:bg-red-700 transition-colors">
              Mua lại
            </button>
          </>
        )}

        {order.status === "delivering" && (
          <button className="px-6 py-2 bg-custom-red text-white font-medium rounded hover:bg-red-700 transition-colors">
            Đã nhận hàng
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
