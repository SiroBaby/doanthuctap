"use client";

import React, { useState } from "react";
import FilterSidebar from "@/app/components/layout/FilterSidebar";
//import ProductCard from "@/app/components/layout/ProductCard";
import Video from "@/app/components/layout/Video";

function Page() {
  // Tạo dữ liệu mẫu cho 16 sản phẩm
  const sampleProducts = Array(40).fill(null);

  // State để quản lý nút sắp xếp đang được chọn
  const [activeSortButton, setActiveSortButton] = useState("popular");

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
              <span>Danh sách video</span>
            </div>
          </div>

          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-gray-700">Sắp xếp theo:</span>
                <div className="flex space-x-1">
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "newest"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("newest")}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "popular"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("popular")}
                  >
                    Phổ biến
                  </button>
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "bestseller"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("bestseller")}
                  >
                    Bán chạy
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Giá:</span>
                <select
                  id="price-filter"
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:border-blue-500"
                  aria-label="Lọc theo giá"
                >
                  <option>Thấp đến cao</option>
                  <option>Cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <FilterSidebar />
              </div>
            </div>

            <div className="md:col-span-9">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Sản phẩm dành cho bạn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {sampleProducts.map((_, index) => (
                    <Video key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
}

export default Page;
