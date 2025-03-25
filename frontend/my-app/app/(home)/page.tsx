"use client";

import AnotherTopBar from "../components/layout/AnotherTopBar";
import ProductCard from "../components/layout/ProductCard";
import Banner from "../components/layout/Banner";
import ProductCategory from "../components/layout/ProductCategory";
import LiveStream from "../components/layout/LiveStream";
import Vouchers from "../components/layout/Vouchers";
import Footer from "../components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_FOR_HOMEPAGE } from "@/graphql/queries";
import "../globals.css";

interface Product {
  product_id: number;
  product_name: string;
  product_images: Array<{
    image_url: string;
    is_thumbnail: boolean;
  }>;
  product_variations: Array<{
    base_price: number;
    percent_discount: number;
  }>;
}

interface ProductsResponse {
  products: {
    data: Product[];
    totalCount: number;
    totalPage: number;
  };
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const { loading, error, data } = useQuery<ProductsResponse>(
    GET_PRODUCTS_FOR_HOMEPAGE,
    {
      variables: {
        page: 1,
        limit: 16,
        search: "",
      },
      onError: (error) => {
        console.error("Error fetching products:", error);
      },
    }
  );

  const products = data?.products?.data || [];
  const sampleLiveStream = Array(4).fill(null);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="w-full">
        <AnotherTopBar />
        <Banner />
        <div className="grid grid-cols-12 pt-3 pb-3">
          <div className="col-span-1"></div>
          <div className="col-span-10 bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          </div>
          <div className="col-span-1"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render products or error state
  return (
    <div className="w-full">
      <AnotherTopBar />
      <Banner />
      <div className="grid grid-cols-12 pt-3 pb-3">
        <div className="col-span-1"></div>
        <div className="col-span-10 bg-white rounded-lg shadow-sm p-4">
          <ProductCategory />
          <section className="mb-8">
            {/* KHO VOUCHER */}
            <div className="flex items-center mb-4">
              <div className="bg-green-300 px-2 py-1 rounded flex items-center">
                <Image
                  src="/icon/voucher.png"
                  width={32}
                  height={32}
                  alt="Voucher"
                  className="mr-2"
                />
                <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                  KHO VOUCHER
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
              <div className="col-span-1 sm:col-span-4 md:col-span-6 lg:col-span-6 space-y-4">
                <Vouchers />
              </div>
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
            </div>
          </section>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á*/}
          <div className="flex justify-center mb-2">
            <button
              className="rounded-full"
              aria-label="button"
              onClick={() => router.push("/customer/category/voucher")}
            >
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>

          <div className="border-t border-black my-4"></div>

          {/* LIVESTREAMS */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-2 py-1 rounded flex items-center">
              <Image
                src="/icon/livestream.png"
                width={32}
                height={32}
                alt="Voucher"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                LIVESTREAM
              </span>
            </div>
          </div>

          {/* Grid livestream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {sampleLiveStream.map((_, index) => (
              <LiveStream key={index} />
            ))}
          </div>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á*/}
          <div className="flex justify-center mb-2">
            <button className="rounded-full" aria-label="button">
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>

          <div className="border-t border-black my-4"></div>

          {/* SẢN PHẨM MỚI NHẤT */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-3 py-1 rounded flex items-center">
              <Image
                src="/icon/shopping-bag.png"
                width={24}
                height={24}
                alt="Cart"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                SẢN PHẨM MỚI NHẤT
              </span>
            </div>
          </div>

          {/* Grid sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {error ? (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-4">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Không thể tải sản phẩm
                </h2>
                <p className="text-gray-600 mb-4">
                  {error.message || "Đã xảy ra lỗi khi tải dữ liệu sản phẩm"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            )}
          </div>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á */}
          <div className="flex justify-center mb-2">
            <Link
              href="/customer/category/product"
              className="rounded-full"
              aria-label="button"
            >
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </Link>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
