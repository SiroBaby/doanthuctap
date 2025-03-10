"use client";
import "@/app/globals.css";
//import { useState, useEffect } from "react";
import AnotherTopBar from "@/app/components/layout/AnotherTopBar";
import ProductCategory from "@/app/components/layout/ProductCategory";
import Footer from "@/app/components/layout/Footer";
//import FilterSidebar from "@/app/components/layout/FilterSidebar";
//import LoadingScreen from "@/app/components/LoadingScreen";
//import { useRouter } from "next/navigation";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //const [isLoading, setIsLoading] = useState(true);
  //const router = useRouter();
  /*
  const handleCategoryClick = (path: string) => {
    router.push(path);
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
  }*/

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="pb-1">
        <AnotherTopBar />
      </div>

      <div className="flex-1 w-full pt-2 pb-2">
        <main className="min-h-[calc(100vh-10rem)]">
          <div className="grid grid-cols-12 pb-3">
            <div className="col-span-1"></div>
            <div className="col-span-10 bg-white rounded-lg shadow-sm">
              <ProductCategory />
            </div>
            <div className="col-span-1"></div>
          </div>
          <div className="pb-2">{children}</div>
        </main>
      </div>

      <div className=" pt-0">
        <Footer />
      </div>
    </div>
  );
}
