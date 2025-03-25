"use client";

//import React, { useState } from "react";
import Vouchers from "@/app/components/layout/Vouchers";

const VoucherPage = () => {
  // Tạo dữ liệu mẫu cho 20 voucher
  const sampleVouchers = Array(10).fill(null);

  // State để quản lý nút sắp xếp đang được chọn
  //const [activeSortButton, setActiveSortButton] = useState("newest");

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-blue-500 pb-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-1"></div>
        <div className="col-span-10">
          {/* Thanh điều hướng */}
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-gray-500">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span>Voucher</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 bg-white">
            <div className="col-span-1"></div>
            <div className="col-span-10">
              <div className="rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {sampleVouchers.map((_, index) => (
                    <div key={index} className="mb-4">
                      <Vouchers />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default VoucherPage;
