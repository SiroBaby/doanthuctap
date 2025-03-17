import React from "react";
import Link from "next/link";
import Image from "next/image";

const EmptyCart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12">
      <div className="relative w-40 h-40 mb-6">
        <Image
          src="/placeholder/empty-cart.svg"
          fill
          alt="Giỏ hàng trống"
          className="object-contain"
        />
      </div>

      <h2 className="text-xl font-medium text-gray-800 mb-2">
        Giỏ hàng của bạn đang trống
      </h2>

      <p className="text-gray-500 text-center mb-8 max-w-md">
        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm và nhận các ưu đãi
        hấp dẫn
      </p>

      <Link
        href="/products"
        className="bg-custom-red hover:bg-red-700 text-white py-3 px-6 rounded font-medium transition-colors"
      >
        Tiếp tục mua sắm
      </Link>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-custom-red mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Giao hàng nhanh</h3>
          <p className="text-gray-500 text-sm">Nhận hàng trong 24h</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-custom-red mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Đảm bảo chất lượng</h3>
          <p className="text-gray-500 text-sm">Kiểm tra hàng trước khi nhận</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-custom-red mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Thanh toán dễ dàng</h3>
          <p className="text-gray-500 text-sm">Nhiều phương thức thanh toán</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
