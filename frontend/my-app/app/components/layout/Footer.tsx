"use client";

import React from "react";
import Image from "next/image";
//import Link from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";

const Footer = () => {
  return (
    <div className="w-full bg-custom-blue py-8 px-4 md:px-12">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-around items-start">
          <div className="w-40 h-40 relative">
            <Image
              src="/logo/logodemo.png"
              alt="shopping"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">DỊCH VỤ KHÁCH HÀNG</h3>
            <div className="flex gap-8">
              <div className="flex-1">
                <ul className="space-y-2">
                  <li>Hướng dẫn mua/ đặt hàng</li>
                  <li>Hướng dẫn bán hàng</li>
                  <li>Đơn hàng</li>
                  <li>Chính sách bảo mật</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">HYSYS</h3>
            <ul className="space-y-2">
              <li>Tin tức</li>
              <li>Đánh giá</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg">LIÊN HỆ</h3>
            <div className="space-y-2">
              <p>SĐT: 0123456789</p>
              <a
                className="hover:text-red-600"
                href="https://www.google.com/maps/place/H%E1%BB%8Dc+Vi%E1%BB%87n+H%C3%A0ng+Kh%C3%B4ng+Vi%E1%BB%87t+Nam+CS2/@10.7999506,106.6533982,18.59z/data=!4m6!3m5!1s0x3175292976c117ad:0x5b3f38b21051f84!8m2!3d10.8000211!4d106.6544162!16s%2Fg%2F1td1mcc1?hl=vi-VN&entry=ttu&g_ep=EgoyMDI0MTEwNi4wIKXMDSoASAFQAw%3D%3D"
              >
                <p>Địa chỉ: Tân Bình, TP.HCM</p>
              </a>
              <div className="flex items-center space-x-4">
                <a
                  className="hover:text-red-600"
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon className="text-2xl" />
                </a>
                <a
                  className="hover:text-red-600"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="text-2xl" />
                </a>
              </div>
            </div>
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
