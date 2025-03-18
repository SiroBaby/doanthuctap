"use client";

import React from "react";

interface ProductDetailProps {
  productData?: {
    category: string;
    warehouse: string;
    style?: string;
    length?: string;
    origin?: string;
    brand: string;
    material?: string;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productData = {
    category: "Áo nam",
    warehouse: "20",
    style: "Tay ngắn",
    length: "Áo dài",
    origin: "Việt Nam",
    brand: "ABC",
    material: "Nỉ",
  },
}) => {
  return (
    <div className="w-full font-sans">
      {/* Header */}
      <div className="bg-gray-100 p-4 rounded-t-md">
        <h2 className="text-lg font-semibold">CHI TIẾT SẢN PHẨM</h2>
      </div>

      {/* bảng này tùy chỉnh sau cho khớp zới bộ dữ liệu bên dtb */}
      <div className="p-0">
        <table className="w-full table-auto border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600 w-36">
                Danh mục
              </td>
              <td className="px-4 py-3 font-medium">{productData.category}</td> 
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600">Kho</td>
              <td className="px-4 py-3 font-medium">{productData.warehouse}</td>{/* Kho được tính bằng tổng của số lượng của phân loại sản phẩm */}
            </tr>
            {/* <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600">
                Phong cách
              </td>
              <td className="px-4 py-3 font-medium">{productData.style}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600">Chiều dài</td>
              <td className="px-4 py-3 font-medium">{productData.length}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600">Xuất xứ</td>
              <td className="px-4 py-3 font-medium">{productData.origin}</td>
            </tr> */}
            <tr className="border-b border-gray-200">
              <td className="px-4 py-3 font-medium text-gray-600">
                Thương hiệu
              </td>
              <td className="px-4 py-3 font-medium">{productData.brand}</td>
            </tr>
            {/* <tr>
              <td className="px-4 py-3 font-medium text-gray-600">Chất liệu</td>
              <td className="px-4 py-3 font-medium">{productData.material}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetail;
