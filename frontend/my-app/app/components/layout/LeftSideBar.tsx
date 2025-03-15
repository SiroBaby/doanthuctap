'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Sử dụng usePathname
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { SvgIcon } from "@mui/material";

const LeftSideBar = ({ onItemClick, onClose }: { onItemClick: (path: string) => void; onClose: () => void; }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  // Đồng bộ selectedItem với URL hiện tại khi component được mount
  useEffect(() => {
    switch (pathname) {
      case "/admin/dashboard":
        setSelectedItem("dashboard");
        break;
      case "/admin/shop":
        setSelectedItem("shop");
        break;
      case "/admin/user":
        setSelectedItem("user");
        break;
      case "/admin/product":
        setSelectedItem("product");
        break;
      case "/admin/order":
        setSelectedItem("order");
        break;
      case "/admin/category":
        setSelectedItem("category");
        break;
      case "/admin/voucher":
        setSelectedItem("voucher");
        break;
      case "/admin/shopvoucher":
        setSelectedItem("shopvoucher");
        break;
      default:
        setSelectedItem("");
    }
  }, [pathname]);

  // Khi click vào các item, gọi onItemClick để chuyển trang và hiện loading
  const handleItemClick = (item: string, path: string) => {
    setSelectedItem(item); // Cập nhật item được chọn
    onItemClick(path); // Gọi hàm từ props để điều hướng và kích hoạt loading
  };

  console.log(selectedItem)

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
            <SvgIcon component={DashboardIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Dashboard</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "shop"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("shop", "/admin/shop")}
          >
            <SvgIcon component={StoreIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Shop</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "user"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("user", "/admin/user")}
          >
            <SvgIcon component={PersonIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">User</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "product"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("product", "/admin/product")}
          >
            <SvgIcon component={InventoryIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Product</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "order"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("order", "/admin/order")}
          >
            <SvgIcon component={RequestPageIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Order</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "category"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("category", "/admin/category")}
          >
            <SvgIcon component={CategoryIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Category</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "voucher"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("voucher", "/admin/voucher")}
          >
            <SvgIcon component={ConfirmationNumberIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Voucher</span>
          </li>

          <li
              className={`flex p-4 text-2xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${selectedItem === "shopvoucher"
                  ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                  : "border-transparent"
              }`}
              onClick={() => handleItemClick("shopvoucher", "/admin/shopvoucher")}
          >
            <SvgIcon component={ConfirmationNumberIcon} className="h-auto w-8 text-custom-red"/>
            <span className="ml-2 text-2xl font-bold">Shop Voucher</span>
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
