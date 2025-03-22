import React from "react";
import Image from "next/image";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/[id]/page";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  discountAmount?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shippingFee,
  totalAmount,
  discountAmount = 0,
}) => {
  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  // Calculate total including discount
  const finalAmount = totalAmount - discountAmount;

  return (
    <div className="bg-white rounded-lg shadow sticky top-4">
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-4">Tóm tắt đơn hàng</h2>
        <div className="max-h-64 overflow-y-auto mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-3 border-b last:border-b-0"
            >
              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                <Image
                  src={item.image || "/placeholder/product-default.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
                <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium line-clamp-2">
                  {item.name}
                </h3>
                {item.variation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Phân loại: {item.variation}
                  </p>
                )}
              </div>
              <div className="ml-2 text-sm font-medium text-custom-red">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-custom-red">
              <span>Giảm giá (voucher):</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-lg font-medium">
            <span>Tổng cộng:</span>
            <span className="text-custom-red">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 p-4 rounded text-sm">
          <p className="flex items-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-custom-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Vui lòng kiểm tra lại thông tin đơn hàng trước khi đặt hàng
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
