"use client";
import React from "react";
import Image from "next/image";

const Footer = () => {
    return (
      <div className="w-full bg-custom-blue py-8 px-4 md:px-12">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-around items-start">
            <div className="w-40 h-40 relative">
              <Image
                src="/logo/logodemo.png" alt="shopping" width={160} height={160} className="object-contain"/>
            </div>
  
            
          </div>
  
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">LIÊN HỆ</h3>
            </div>
  
          </div>
        </div>
  
        <div className="text-center mt-8 text-sm text-gray-600 border-t pt-4">
          <p>Đồ án thực tập - Học kì 2 - 2024-2025</p>
        </div>
      </div>
    );
  };
  
  export default Footer;