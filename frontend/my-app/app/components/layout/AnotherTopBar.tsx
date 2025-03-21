"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
//import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

const AnotherTopBar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  // Đánh dấu đã render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cập nhật tên người dùng
  useEffect(() => {
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  // Tránh lỗi hydration
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-tr from-left-anothertopbar to-right-anothertopbar pt-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <span className="text-white cursor-pointer">Kênh người bán</span>
            <span className="text-white cursor-pointer">Kết nối Facebook</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-white font-bold shadow-text">
                  Hi, {userName}
                </span>
              </div>
            )}
            {!user && <span className="text-white">User</span>}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="font-bold text-white">
            <Image src="/logo/logodemo.png" width={120} height={0} alt="logo" />
          </div>

          <div className="flex justify-center flex-grow mx-4">
            <div className="relative w-4/6">
              <input
                type="text"
                className="w-full bg-white rounded-full pl-10 pr-10 h-10 border-none outline-none shadow-md"
                placeholder="Tìm kiếm..."
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/icon/search.png"
                  width={20}
                  height={20}
                  alt="search"
                />
              </div>
            </div>
          </div>

          <button className="p-2 rounded-full" aria-label="shopping">
            <Image
              src="/icon/shopping.png"
              width={30}
              height={30}
              alt="shopping"
              onClick={() => router.push(`/customer/shoppingcart/${userId}`)}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnotherTopBar;
