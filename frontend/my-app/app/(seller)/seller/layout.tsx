"use client"
import "@/app/globals.css";
import { useState, useEffect } from "react";
import SellerTopBar from "@/app/components/layout/SellerTopBar";
import SellerLeftSideBar from "@/app/components/layout/SellerLeftSideBar";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { GET_USER_BY_ID } from "@/graphql/queries";
import { useQuery } from "@apollo/client";

export default function SellerLayout({
                                        children,
                                    }: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { userId, isLoaded } = useAuth();

    const { data: userData, loading: isUserLoading } = useQuery(GET_USER_BY_ID, {
        variables: { id: userId },
        skip: !userId // Bỏ qua query nếu chưa có userId
    });

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
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            console.log(userData)
            console.log('userid', userId)
            if (!userId) {
                router.push('/sign-in');
            } else if (!isUserLoading && userData?.user) {
                if (userData.user.role !== "seller") {
                    router.push('/');
                }
            } else if (!isUserLoading && !userData?.user) {
                router.push('/');
            }
        }
    }, [isLoaded, userId, userData, isUserLoading, router]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex">
            <div className={`hidden lg:block fixed top-0 left-0 h-screen w-60 bg-white shadow-xl dark:bg-dark-sidebar transition-transform duration-300`}>
                <SellerLeftSideBar onItemClick={handleItemClick} onClose={handleCloseSidebar} />
            </div>
            <div className={`fixed top-0 left-0 h-screen w-60 bg-white shadow-xl dark:bg-dark-sidebar transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
                <SellerLeftSideBar onItemClick={handleItemClick} onClose={handleCloseSidebar} />
            </div>
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'lg:ml-60'}`}>
                <SellerTopBar onToggleSidebar={toggleSidebar} />
                <main className="h-min-screen bg-gray-100 dark:bg-dark-body">{children}</main>
            </div>
        </div>
    );
}