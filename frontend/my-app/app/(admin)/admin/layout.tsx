"use client"
import "@/app/globals.css";
import { useState, useEffect } from "react";
import TopBar from "@/app/components/layout/TopBar";
import LeftSideBar from "@/app/components/layout/LeftSideBar";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleItemClick = (path: string) => {
        router.push(path);
        setSidebarOpen(false);
    };

    useEffect(() => {
        // Simulate loading time for components
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex">
            {/* Sidebar cho màn hình lớn */}
            <div className={`hidden lg:block fixed top-0 left-0 h-screen w-60 bg-white shadow-xl dark:bg-dark-sidebar transition-transform duration-300`}>
                <LeftSideBar onItemClick={handleItemClick} onClose={handleCloseSidebar} />
            </div>
            {/* Sidebar cho màn hình nhỏ */}
            <div className={`fixed top-0 left-0 h-screen w-60 bg-white shadow-xl dark:bg-dark-sidebar transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
                <LeftSideBar onItemClick={handleItemClick} onClose={handleCloseSidebar} />
            </div>
            {/* Nội dung chính */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'lg:ml-60'}`}>
                <TopBar onToggleSidebar={toggleSidebar} />
                <main className="h-min-screen bg-gray-100 dark:bg-dark-body">{children}</main>
            </div>
        </div>
    );
}
