"use client";

import React, { useState } from "react";
import FilterSidebar from "@/app/components/layout/FilterSidebar";
import ProductCard from "@/app/components/layout/ProductCard";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { GET_PRODUCTS_FOR_HOMEPAGE } from "@/graphql/queries";

// Define the product interface
interface ProductImage {
  image_url: string;
  is_thumbnail: boolean;
}

interface ProductVariation {
  base_price: number;
  percent_discount: number;
}

interface Product {
  product_id: number;
  product_name: string;
  product_images: ProductImage[];
  product_variations: ProductVariation[];
}

interface ProductsResponse {
  products: {
    data: Product[];
    totalCount: number;
    totalPage: number;
  };
}

const ProductPage = () => {
  const router = useRouter();

  // Navigate to home page
  const navigateToHome = () => {
    router.push("/");
  };
  // Fetch products from API
  const { loading, error, data } = useQuery<ProductsResponse>(
    GET_PRODUCTS_FOR_HOMEPAGE,
    {
      variables: {
        page: 1,
        limit: 40,
        search: "",
      },
    }
  );

  // State để quản lý nút sắp xếp đang được chọn
  const [activeSortButton, setActiveSortButton] = useState("popular");

  // Create sample products when real data isn't available yet
  const sampleProducts: Product[] = Array(40)
    .fill(null)
    .map((_, index) => ({
      product_id: index,
      product_name: `Sample Product ${index + 1}`,
      product_images: [
        {
          image_url: "/icon/null.png",
          is_thumbnail: true,
        },
      ],
      product_variations: [
        {
          base_price: 100000,
          percent_discount: 0.1,
        },
      ],
    }));

  // Use real data if available, otherwise use sample data
  const products = data?.products?.data || sampleProducts;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-blue-500 pb-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-1"></div>
        <div className="col-span-10">
          {/* Navigation breadcrumb */}
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-gray-500">
              <button
                onClick={navigateToHome}
                className="hover:text-blue-600 cursor-pointer"
              >
                Home
              </button>
              <span className="mx-2">/</span>
              <span>Danh mục</span>
            </div>
          </div>

          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-gray-700">Sắp xếp theo:</span>
                <div className="flex space-x-1">
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "newest"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("newest")}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "popular"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("popular")}
                  >
                    Phổ biến
                  </button>
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      activeSortButton === "bestseller"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveSortButton("bestseller")}
                  >
                    Bán chạy
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Giá:</span>
                <select
                  id="price-filter"
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:border-blue-500"
                  aria-label="Lọc theo giá"
                >
                  <option>Thấp đến cao</option>
                  <option>Cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-3">
              <div className=" rounded-lg shadow-sm pt-4">
                <FilterSidebar />
              </div>
            </div>

            <div className="md:col-span-9">
              <div className="pt-4">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {Array(8)
                      .fill(null)
                      .map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">
                    Error loading products
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {products.map((product, index) => (
                      <ProductCard key={index} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default ProductPage;
