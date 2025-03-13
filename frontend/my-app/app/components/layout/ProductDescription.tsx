"use client";

import React, { useState } from "react";
import Image from "next/image";

const ProductDescription: React.FC = () => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="w-full mt-2 bg-white">
      <div className="bg-gray-100 p-4 rounded-t-md">
        <h2 className="text-lg font-semibold">MÔ TẢ SẢN PHẨM</h2>
      </div>
      {/* này để tượng trưng hoi nếu call api đổ dữ liệu về thì bên seller chỉ cần nhập 1 ô input với ô nhập ảnh ròi ưng ghi gì ghi thêm gì thêm như viết word á xong xổ hết ra:))*/}
      {/*hoặc ưng chỉnh sao thì chỉnh sau */}
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "description"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("description")}
        >
          MÔ TẢ SẢN PHẨM
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "size"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("size")}
        >
          KÍCH CỠ ÁO
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "care"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("care")}
        >
          HƯỚNG DẪN BẢO QUẢN
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "warranty"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("warranty")}
        >
          CHÍNH SÁCH BẢO HÀNH
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "image"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("image")}
        >
          HÌNH ẢNH
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div>
            <h2 className="text-lg font-bold mb-3">
              ÁO THUN LITTLEBROTHER 100% COTTON
            </h2>
            <h3 className="text-md font-semibold mb-2">CHI TIẾT</h3>
            <ul className="space-y-2">
              <li>-Chất liệu : 100% sợi cotton dệt</li>
              <li>-Định lượng : 230gsm</li>
              <li>
                -Chất áo mềm mịn, thấm hút tốt khi tiếp xúc trên da, khi gặp
                nước áo không bị co cứng.
              </li>
              <li>- Form áo thoải mái không bị gò bó khi vận động</li>
              <li>-Hình in chuyển nhiệt sắc nét, độ bền màu cao</li>
            </ul>
          </div>
        )}

        {/* Size Tab */}
        {activeTab === "size" && (
          <div>
            <h2 className="text-lg font-bold mb-3">KÍCH CỠ ÁO</h2>
            <ul className="space-y-2">
              <li>M : dài 68, rộng 53, tay áo 22.5</li>
              <li>L : dài 70, rộng 55, tay áo 23.5</li>
              <li>XL : dài 72, rộng 57, tay áo 24.5</li>
              <li className="text-sm italic">
                (Tùy vào cao nặng khác nhau nên các bác nhắn tin shop tư vấn là
                chuẩn nhất nhaaa)
              </li>
            </ul>
          </div>
        )}

        {/* Care Tab */}
        {activeTab === "care" && (
          <div>
            <h2 className="text-lg font-bold mb-3">HƯỚNG DẪN BẢO QUẢN ÁO:</h2>
            <ul className="space-y-2">
              <li>-Giặt ở nhiệt độ bình thường</li>
              <li>
                -Hạn chế sử dụng máy sấy, nếu ủi áo nên chọn nhiệt độ thích hợp
              </li>
              <li>
                -Lộn mặt trái áo khi giặt và phơi tránh ảnh hưởng đến hình in
              </li>
              <li>-Không dùng hóa chất tẩy trực tiếp lên áo</li>
            </ul>
          </div>
        )}

        {/* Warranty Tab */}
        {activeTab === "warranty" && (
          <div>
            <h2 className="text-lg font-bold mb-3">CHÍNH SÁCH BẢO HÀNH</h2>
            <ul className="space-y-2">
              <li>
                + Hình ảnh sản phẩm có thể chênh lệch một ít vì điều kiện ánh
                sáng và màn hình điện thoại
              </li>
              <li>
                + Shop cam kết hình in trên áo luôn sắc nét, không nhòe và lem
                mực
              </li>
              <li>
                + Đối với hình in trên áo, nếu quý khách sau giặt một lần hình
                có hiện tượng bong tróc, nứt hình vui lòng nhắn tin cho shop để
                đổi áo mới cho mình ạ
              </li>
              <li>+ CAM KẾT ĐƯỢC ĐỔI TRẢ HÀNG TRONG VÒNG 7 NGÀY</li>
            </ul>
          </div>
        )}

        {/* hình ảnh Tab */}
        {activeTab === "image" && (
          <div>
            <Image
              src="/icon/ao-d.png"
              alt="shopping"
              width={440}
              height={440}
              className="object-contain"
            />
            <Image
              src="/icon/ao-d2.png"
              alt="shopping"
              width={440}
              height={440}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
