"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { SvgIcon } from "@mui/material";

const UserLeftSideBar = ({
  onItemClick,
  onClose,
  username = "Người dùng",
}: {
  onItemClick: (path: string) => void;
  onClose: () => void;
  username?: string;
}) => {
  const [selectedItem, setSelectedItem] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("/customer/user/profile")) {
      setSelectedItem("profile");
    } else if (pathname.includes("/customer/user/address")) {
      setSelectedItem("address");
    } else if (pathname.includes("/customer/user/purchase")) {
      setSelectedItem("order");
    }
  }, [pathname]);

  const handleItemClick = (item: string, path: string) => {
    setSelectedItem(item);
    onItemClick(path);
  };

  return (
    <div className="h-screen w-60 left-0 top-0 sticky flex flex-col bg-white shadow-xl dark:bg-dark-sidebar transition-colors duration-200">
      <div className="h-32 flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <AccountCircleIcon className="h-full w-full text-gray-500" />
        </div>
        <h2 className="mt-2 text-xl font-bold dark:text-dark-text">
          {username}
        </h2>
      </div>

      <div className="left-0 dark:text-dark-text">
        <ul>
          <li className="border-b border-outline dark:border-dark-outline"></li>

          <li
            className={`flex p-4 text-xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${
              selectedItem === "profile"
                ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                : "border-transparent"
            }`}
            onClick={() => handleItemClick("profile", "/customer/user/profile")}
          >
            <SvgIcon
              component={PersonIcon}
              className="h-auto w-6 text-custom-red"
            />
            <span className="ml-2 text-xl font-bold">Hồ sơ của tôi</span>
          </li>

          <li
            className={`flex p-4 text-xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${
              selectedItem === "address"
                ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                : "border-transparent"
            }`}
            onClick={() => handleItemClick("address", "/customer/user/address")}
          >
            <SvgIcon
              component={HomeIcon}
              className="h-auto w-6 text-custom-red"
            />
            <span className="ml-2 text-xl font-bold">Địa chỉ</span>
          </li>

          <li
            className={`flex p-4 text-xl font-semibold pl-9 items-center cursor-pointer border-r-8 ${
              selectedItem === "order"
                ? "border-custom-red bg-selected-corlor dark:bg-dark-selected"
                : "border-transparent"
            }`}
            onClick={() => handleItemClick("order", "/customer/user/purchase")} // Corrected line
          >
            <SvgIcon
              component={ShoppingBagIcon}
              className="h-auto w-6 text-custom-red"
            />
            <span className="ml-2 text-xl font-bold">Đơn hàng</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onClose}
        className="p-4 text-lg text-red-500 lg:hidden mt-auto"
      >
        Đóng
      </button>
    </div>
  );
};

export default UserLeftSideBar;
