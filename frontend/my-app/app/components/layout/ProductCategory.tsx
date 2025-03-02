"use client";  

import React from 'react';  
import { useState } from 'react';  
import Image from "next/image";  

const ProductCategory = () => {  
    const [isOpen, setIsOpen] = useState(false); // State quản lý trạng thái mở/đóng dropdown  

    const toggleDropdown = () => {  
        setIsOpen(!isOpen); // Chuyển đổi trạng thái mở/đóng  
    };  
  return (  
    <div className="container mx-auto p-4">  
        {/* menu cho thiết bị màn hình nhỏ*/}  
        <div className="md:hidden">  
          <button onClick={toggleDropdown} className="flex items-center" aria-label="shipping">  
            <Image src="/icon/menu.png" width={30} height={30} alt="Menu" />  
          </button>  
        </div>  

      {/* Danh mục*/}  
      <section className="mb-4 ${isOpen ? 'block' : 'hidden'} md:flex`">  
        <h2 className="text-xl font-semibold mb-2">Danh mục</h2>  
        <div className="flex flex-wrap justify-between">  
          {/* Danh mục 1 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/brand.png" width={40} height={40} alt="Quần áo" />  
            <p className="text-center text-gray-600">Quần áo</p>  
          </div>  
          {/* Danh mục 2 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/shoes.png" width={40} height={40} alt="Giày dép" />  
            <p className="text-center text-gray-600">Giày dép</p>  
          </div>  
          {/* Danh mục 3 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/hand-watch.png" width={40} height={40} alt="Đồng hồ" />  
            <p className="text-center text-gray-600">Đồng hồ</p>  
          </div>  
          {/* Danh mục 4 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/iphone.png" width={40} height={40} alt="Điện thoại" />  
            <p className="text-center text-gray-600">Điện thoại</p>  
          </div>  
          {/* Danh mục 5 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/computer.png" width={40} height={40} alt="Máy tính & laptop" />  
            <p className="text-center text-gray-600">Máy tính & laptop</p>  
          </div>  
          {/* Danh mục 6 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/keyboard.png" width={40} height={40} alt="Phụ kiện máy tính" />  
            <p className="text-center text-gray-600">Phụ kiện máy tính</p>  
          </div>  
          {/* Danh mục 7 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/ram-memory.png" width={40} height={40} alt="Linh kiện điện tử" />  
            <p className="text-center text-gray-600">Linh kiện điện tử</p>  
          </div>  
          {/* Danh mục 8 */}  
          <div className="flex flex-col items-center mb-2">  
            <Image src="/icon/point.png" width={40} height={40} alt="Xem thêm" />  
            <p className="text-center text-gray-600">Xem thêm</p>  
          </div>  
        </div>  
      </section>  

      
    </div>  
  );  
};  

export default ProductCategory;  