import React from "react";

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, onTabChange }) => {
  // Danh sách các tab trạng thái đơn hàng
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "shipping", label: "Vận chuyển" },
    { id: "delivering", label: "Chờ giao hàng" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
    { id: "returned", label: "Trả hàng/Hoàn tiền" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-center whitespace-nowrap min-w-fit text-sm font-medium ${
              activeTab === tab.id
                ? "text-custom-red border-b-2 border-custom-red"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderTabs;
