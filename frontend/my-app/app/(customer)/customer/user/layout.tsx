"use client";
import "@/app/globals.css";
import { useState } from "react";
import UserLeftSideBar from "@/app/components/layout/UserLeftSideBar";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const handleItemClick = (path: string) => {
    router.push(path);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Khoảng cách bên trái - ẩn trên mobile */}
        <div className="hidden md:block md:col-span-1"></div>

        {/* Sidebar cho desktop (hidden trên mobile) */}
        <div className="hidden lg:block lg:col-span-2">
          <UserLeftSideBar onItemClick={handleItemClick} onClose={() => {}} />
        </div>

        {/* Button hiển thị sidebar trên mobile */}
        <div className="col-span-12 lg:hidden flex py-2">
          <button
            onClick={toggleMobileSidebar}
            className="text-white py-2 px-4 rounded flex items-center"
            aria-label="Toggle sidebar menu" // Add this line
          >
            <Image
              src="/icon/menu.png"
              alt="Menu"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </div>

        {/* Sidebar cho mobile (chỉ hiển thị khi được bật) */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="h-full w-64 bg-white">
              <UserLeftSideBar
                onItemClick={(path) => {
                  handleItemClick(path);
                  setIsMobileSidebarOpen(false);
                }}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Nội dung chính */}
        <div className="col-span-12 md:col-span-10 lg:col-span-8 mx-auto">
          <main className="min-h-[calc(100vh-10rem)]">{children}</main>
        </div>

        {/* Khoảng cách bên phải - ẩn trên mobile */}
        <div className="hidden md:block md:col-span-1"> </div>
      </div>
    </div>
  );
}
