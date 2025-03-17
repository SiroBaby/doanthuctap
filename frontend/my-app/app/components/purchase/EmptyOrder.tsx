import React from "react";
import Image from "next/image";
import Link from "next/link";

const EmptyOrder = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-32 h-32 relative mb-6">
        <Image
          src="/images/empty-order.svg"
          alt="Chưa có đơn hàng"
          fill
          className="object-contain"
          onError={(e) => {
            // Fallback nếu không có ảnh
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFOUVDRUYiLz48cGF0aCBkPSJNMjUgMzBINzVWNzBIMjVWMzBaIiBmaWxsPSIjQTBBMEEwIi8+PHBhdGggZD0iTTM1IDQ1SDY1VjU1SDM1VjQ1WiIgZmlsbD0iI0U5RUNFRiIvPjwvc3ZnPg==";
          }}
        />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        Chưa có đơn hàng
      </h3>
      <p className="text-gray-500 mb-6 text-center">
        Bạn chưa có đơn hàng nào trong mục này
      </p>

      <Link
        href="/"
        className="px-6 py-2 bg-custom-red text-white font-medium rounded hover:bg-red-700 transition-colors"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
};

export default EmptyOrder;
