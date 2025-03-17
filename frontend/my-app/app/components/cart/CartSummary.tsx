import React from "react";

interface CartSummaryProps {
  selectedItemsCount: number;
  totalAmount: number;
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  selectedItemsCount,
  totalAmount,
  onCheckout,
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

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <h2 className="text-lg font-medium mb-4">Tóm tắt đơn hàng</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Sản phẩm đã chọn:</span>
          <span>{selectedItemsCount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span>Được tính khi thanh toán</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between font-medium text-lg mb-4">
          <span>Tổng cộng:</span>
          <span className="text-custom-red">{formatCurrency(totalAmount)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={selectedItemsCount === 0}
          className={`w-full py-3 rounded text-white font-medium 
          ${
            selectedItemsCount > 0
              ? "bg-custom-red hover:bg-red-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          aria-label="Thanh toán đơn hàng"
          title={
            selectedItemsCount > 0
              ? `Thanh toán ${selectedItemsCount} sản phẩm`
              : "Vui lòng chọn sản phẩm để thanh toán"
          }
        >
          Thanh toán ({selectedItemsCount})
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          * Phí vận chuyển sẽ được tính dựa trên địa chỉ giao hàng và khối lượng
          sản phẩm
        </p>
        <p>
          * Giá sản phẩm có thể thay đổi tùy theo khuyến mãi tại thời điểm thanh
          toán
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
