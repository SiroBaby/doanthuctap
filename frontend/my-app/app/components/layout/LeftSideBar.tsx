'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Sử dụng usePathname
import DashboardIcon from "@mui/icons-material/Dashboard";
import TourIcon from "@mui/icons-material/Tour";
import PersonIcon from "@mui/icons-material/Person";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { SvgIcon } from "@mui/material";

const LeftSideBar = ({ onItemClick, onClose }: { onItemClick: (path: string) => void; onClose: () => void; }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  // Đồng bộ selectedItem với URL hiện tại khi component được mount
  useEffect(() => {
    if (pathname.includes("/dashboard")) {
      setSelectedItem("dashboard");
    } else if (pathname.includes("/admin/shop")) {
      setSelectedItem("shop");
    } else if (pathname.includes("/admin/user")) {
      setSelectedItem("user");
    } else if (pathname.includes("/admin/product")) {
      setSelectedItem("product");
    } else if (pathname.includes("/admin/order")) {
      setSelectedItem("order");
    } else if (pathname.includes("/admin/category")) {
      setSelectedItem("category");
    }
  }, [pathname]);

  // Khi click vào các item, gọi onItemClick để chuyển trang và hiện loading
  const handleItemClick = (item: string, path: string) => {
    setSelectedItem(item); // Cập nhật item được chọn
    onItemClick(path); // Gọi hàm từ props để điều hướng và kích hoạt loading
  };

  return (
    <div className="h-screen w-60 left-0 top-0 sticky flex flex-col bg-white shadow-xl dark:bg-dark-sidebar transition-colors duration-200">
      <div className="h-32 flex justify-center">
        <Image src="/logo/logo.png" width={120} height={0} alt="logo" />
      </div>
      <div className="left-0 dark:text-dark-text">
        <ul>
          <li className="border-b border-outline dark:border-dark-outline"></li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "dashboard"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("dashboard", "/admin/dashboard")}
          >
            <SvgIcon component={DashboardIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">Dashboard</span>
          </li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "tour"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("shop", "/admin/shop")}
          >
            <SvgIcon component={TourIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">Shop</span>
          </li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "user"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("user", "/admin/user")}
          >
            <SvgIcon component={PersonIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">User</span>
          </li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "tour"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("product", "/admin/product")}
          >
            <SvgIcon component={TourIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">Product</span>
          </li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "order"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("order", "/admin/order")}
          >
            <SvgIcon component={RequestPageIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">Order</span>
          </li>

          <li
            className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "vehicle"
              ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
              : "border-transparent"
              }`}
            onClick={() => handleItemClick("category", "/admin/category")}
          >
            <SvgIcon component={DirectionsBusIcon} className="h-auto w-8 text-custom-red" />
            <span className="ml-2 text-2xl font-bold">Category</span>
          </li>
        </ul>
      </div>

      {/* Nút đóng sidebar */}
      <button onClick={onClose} className="p-4 text-lg text-red-500 lg:hidden">
        Đóng
      </button>
    </div>
  );
};

export default LeftSideBar;
