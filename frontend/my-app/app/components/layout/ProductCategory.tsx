"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "@/graphql/queries";
import { useRouter } from "next/navigation";

// Define interfaces for type safety
interface Category {
  category_id: number;
  category_name: string;
  create_at: string;
  update_at: string;
}

interface CategoriesResponse {
  categorys: {
    data: Category[];
    totalCount: number;
    totalPage: number;
  };
}

// Map of category names to icons
const categoryIcons: Record<string, string> = {
  "Quần áo": "/icon/brand.png",
  "Giày dép": "/icon/shoes.png",
  "Đồng hồ": "/icon/hand-watch.png",
  "Điện thoại": "/icon/iphone.png",
  "Máy tính & laptop": "/icon/computer.png",
  "Phụ kiện máy tính": "/icon/keyboard.png",
  "Linh kiện điện tử": "/icon/ram-memory.png",
  // Add more mappings as needed
};

// Default fallback icon
const defaultIcon = "/icon/brand.png";

const ProductCategory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Fetch categories from GraphQL API
  const { loading, error, data } = useQuery<CategoriesResponse>(
    GET_CATEGORIES,
    {
      variables: {
        page: 1,
        limit: 7,
        search: "",
      },
    }
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Navigate to category products page
  const navigateToCategory = (categoryId: number, categoryName: string) => {
    router.push(
      `/customer/category/product?category=${categoryId}&categoryName=${encodeURIComponent(
        categoryName
      )}`
    );
  };

  // Prepare categories data - use data from API or fallback to default categories
  const categories = data?.categorys?.data || [];

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg p-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold mb-4 hidden md:block">
              Danh mục
            </h2>
          </div>
          <div className="flex flex-col items-center md:flex-row md:flex-wrap md:justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div
                key={item}
                className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 animate-pulse"
              >
                <div className="bg-gray-200 rounded-full w-10 h-10 mb-2"></div>
                <div className="bg-gray-200 h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error("Error fetching categories:", error);
    // Continue with default UI as fallback
  }

  return (
    <div className="container mx-auto p-4">
      {/* Navbar for mobile */}
      <nav className="bg-white border-gray-200 dark:bg-gray-900 md:hidden">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
          <button
            onClick={toggleDropdown}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-btext-black"
            aria-controls="navbar-default"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </nav>

      <div className="rounded-lg p-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold mb-4 hidden md:block">
            Danh mục
          </h2>
        </div>

        {/* Categories section */}
        <section
          id="navbar-default"
          className={`${isOpen ? "block" : "hidden"} md:block`}
        >
          <div className="flex flex-col items-center md:flex-row md:flex-wrap md:justify-between">
            {categories.length > 0 ? (
              // Display categories from the API
              categories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-gray-50"
                  onClick={() =>
                    navigateToCategory(
                      category.category_id,
                      category.category_name
                    )
                  }
                >
                  <div className="relative w-12 h-12 mb-2">
                    <Image
                      src={categoryIcons[category.category_name] || defaultIcon}
                      fill
                      className="object-contain"
                      alt={category.category_name}
                    />
                  </div>
                  <p className="text-center text-black font-medium">
                    {category.category_name}
                  </p>
                </div>
              ))
            ) : (
              // Fallback to default categories if API returns no data
              <>
                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/brand.png"
                    width={40}
                    height={40}
                    alt="Quần áo"
                  />
                  <p className="text-center text-black">Quần áo</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/shoes.png"
                    width={40}
                    height={40}
                    alt="Giày dép"
                  />
                  <p className="text-center text-black">Giày dép</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/hand-watch.png"
                    width={40}
                    height={40}
                    alt="Đồng hồ"
                  />
                  <p className="text-center text-black">Đồng hồ</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/iphone.png"
                    width={40}
                    height={40}
                    alt="Điện thoại"
                  />
                  <p className="text-center text-black">Điện thoại</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/keyboard.png"
                    width={40}
                    height={40}
                    alt="Máy tính & laptop"
                  />
                  <p className="text-center text-black">Máy tính & laptop</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/keyboard.png"
                    width={40}
                    height={40}
                    alt="Phụ kiện máy tính"
                  />
                  <p className="text-center text-black">Phụ kiện máy tính</p>
                </div>

                <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4 cursor-pointer">
                  <Image
                    src="/icon/ram-memory.png"
                    width={40}
                    height={40}
                    alt="Linh kiện điện tử"
                  />
                  <p className="text-center text-black">Linh kiện điện tử</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductCategory;
