/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import AnotherTopBar from "../components/layout/AnotherTopBar";
import ProductCard from "../components/layout/ProductCard";
import Banner from "../components/layout/Banner";
import ProductCategory from "../components/layout/ProductCategory";
//import LiveStream from "../components/layout/LiveStream";
import Vouchers from "../components/layout/Vouchers";
import Footer from "../components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCTS_FOR_HOMEPAGE,
  GET_ADMIN_DASHBOARD_STATS,
  GET_USER_PURCHASE_CATEGORIES,
} from "@/graphql/queries";
import "../globals.css";
import { useUser } from "@/contexts/UserContext";
import React from "react";

/**
 * Interface mô tả cấu trúc của một sản phẩm
 * @property product_id - ID duy nhất của sản phẩm
 * @property product_name - Tên sản phẩm
 * @property product_images - Mảng chứa các hình ảnh của sản phẩm
 * @property product_variations - Mảng chứa các biến thể của sản phẩm (giá, giảm giá...)
 * @property create_at - Thời gian tạo sản phẩm (tùy chọn)
 * @property total_sales - Tổng số lượng đã bán (tùy chọn)
 * @property category - Thông tin danh mục của sản phẩm (tùy chọn)
 */
interface Product {
  product_id: number;
  product_name: string;
  brand: string;
  status: string;
  category?: {
    category_id: number;
    category_name: string;
  };
  product_images: Array<{
    image_url: string;
    is_thumbnail: boolean;
  }>;
  product_variations: Array<{
    product_variation_id: number;
    product_variation_name: string;
    base_price: number;
    percent_discount: number;
    stock_quantity: number;
    status: string;
  }>;
}

/**
 * Interface mô tả cấu trúc phản hồi từ API khi lấy danh sách sản phẩm
 * @property products - Đối tượng chứa thông tin sản phẩm và phân trang
 */
interface ProductsResponse {
  products: {
    data: Product[];
    totalCount: number;
    totalPage: number;
  };
}

/**
 * Interface mô tả cấu trúc của sản phẩm bán chạy
 * @property product_id - ID duy nhất của sản phẩm
 * @property product_name - Tên sản phẩm
 * @property total_quantity - Tổng số lượng đã bán
 * @property total_revenue - Tổng doanh thu từ sản phẩm
 * @property product - Đối tượng chứa thông tin sản phẩm
 */
interface TopSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  product: {
    product_images: {
      image_url: string;
      is_thumbnail: boolean;
    }[];
    shop: {
      shop_name: string;
    };
  };
}

// Interface cho danh mục sản phẩm mà người dùng đã mua
interface Category {
  category_id: number;
  category_name: string;
  create_at: Date | null;
  update_at: Date | null;
  delete_at: Date | null;
}

/**
 * Component trang chủ của ứng dụng
 *
 * Component này hiển thị trang chủ với nhiều phần khác nhau:
 * - Kho voucher
 * - Sản phẩm dành cho người dùng
 * - Sản phẩm mới nhất
 * - Sản phẩm bán chạy
 *
 * Mỗi phần đều có thể mở rộng để xem nhiều sản phẩm hơn bằng cách nhấp vào nút bên dưới
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();

  /**
   * Query lấy danh sách sản phẩm mới nhất
   * Sử dụng GraphQL để lấy 12 sản phẩm mới nhất
   */
  const {
    loading: loadingNewest,
    error: errorNewest,
    data: dataNewest,
  } = useQuery<ProductsResponse>(GET_PRODUCTS_FOR_HOMEPAGE, {
    variables: {
      page: 1,
      limit: 12,
      search: "",
      sort: "newest",
    },
    onError: (error) => {
      console.error("Error fetching newest products:", error);
    },
  });

  /**
   * Query lấy top sản phẩm bán chạy
   * Sử dụng GraphQL để lấy 12 sản phẩm bán chạy nhất
   */
  const {
    loading: loadingBestSeller,
    error: errorBestSeller,
    data: dataBestSeller,
  } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
    onError: (error) => {
      console.error("Error fetching bestseller products:", error);
    },
  });

  /**
   * Query lấy danh mục sản phẩm mà người dùng đã mua
   * Chỉ thực hiện khi người dùng đã đăng nhập (có user_id)
   */
  const {
    loading: loadingUserCategories,
    error: errorUserCategories,
    data: dataUserCategories,
  } = useQuery(GET_USER_PURCHASE_CATEGORIES, {
    variables: {
      userId: user?.user_id || "",
    },
    skip: !user?.user_id,
    onError: (error) => {
      console.error("Error fetching user purchase categories:", error);
    },
  });

  /**
   * Query lấy sản phẩm dựa trên danh mục mà người dùng đã mua
   * Chỉ thực hiện khi đã có danh mục sản phẩm của người dùng
   */
  const userCategoryIds = React.useMemo(() => {
    if (!dataUserCategories?.getUserPurchaseCategories) return [];
    return dataUserCategories.getUserPurchaseCategories.map(
      (cat: Category) => cat.category_id
    );
  }, [dataUserCategories]);

  const {
    loading: loadingForYou,
    error: errorForYou,
    data: dataForYou,
  } = useQuery<ProductsResponse>(GET_PRODUCTS_FOR_HOMEPAGE, {
    variables: {
      page: 1,
      limit: 12,
      search: "",
    },
    skip: !user?.user_id,
    onError: (error) => {
      console.error("Error fetching for you products:", error);
    },
  });

  // Lọc sản phẩm dựa trên danh mục từ đơn hàng của người dùng
  const forYouProducts = React.useMemo(() => {
    if (!dataForYou?.products?.data || userCategoryIds.length === 0) {
      return dataForYou?.products?.data || [];
    }

    return dataForYou.products.data.filter(
      (product: Product) =>
        product.category &&
        userCategoryIds.includes(product.category.category_id)
    );
  }, [dataForYou, userCategoryIds]);

  // Lấy dữ liệu sản phẩm từ kết quả query hoặc mảng rỗng nếu chưa có dữ liệu
  const newestProducts = dataNewest?.products?.data || [];
  const bestSellerProducts =
    dataBestSeller?.getAdminDashboardStats?.topSellingProducts || [];

  /**
   * Hiển thị trạng thái đang tải (loading) với hiệu ứng skeleton
   * Hiển thị khi bất kỳ một trong các query đang thực hiện
   */
  if (
    loadingNewest ||
    loadingBestSeller ||
    loadingForYou ||
    loadingUserCategories
  ) {
    return (
      <div className="w-full">
        <AnotherTopBar />
        <Banner />
        <div className="grid grid-cols-12 pt-3 pb-3">
          <div className="col-span-1"></div>
          <div className="col-span-10 bg-white rounded-lg shadow-sm p-4">
            {/* Skeleton loading cho các sản phẩm */}
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

  // Hiển thị trang chủ khi đã tải xong dữ liệu
  return (
    <div className="w-full">
      {/* Thanh điều hướng trên cùng */}
      <AnotherTopBar />

      {/* Banner quảng cáo */}
      <Banner />

      {/* Phần thân chính của trang */}
      <div className="grid grid-cols-12 pt-3 pb-3">
        <div className="col-span-1"></div>
        <div className="col-span-10 bg-white rounded-lg shadow-sm p-4">
          {/* Phần danh mục sản phẩm */}
          <ProductCategory />

          {/* Phần KHO VOUCHER */}
          <section className="mb-8">
            {/* Tiêu đề phần KHO VOUCHER */}
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

            {/* Lưới hiển thị voucher */}
            <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
              <div className="col-span-1 sm:col-span-4 md:col-span-6 lg:col-span-6 space-y-4">
                <Vouchers limit={2} />
              </div>
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
            </div>
          </section>

          {/* Nút chuyển trang để xem thêm voucher */}
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

          {/* Đường phân cách giữa các phần */}
          <div className="border-t border-black my-4"></div>

          {/* [Phần LIVESTREAM đã bị comment out trong code gốc] */}

          {/* Phần DÀNH CHO BẠN - hiển thị sản phẩm được đề xuất cá nhân hóa dựa trên danh mục sản phẩm đã mua */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-3 py-1 rounded flex items-center">
              <Image
                src="/icon/shopping-bag.png"
                width={30}
                height={30}
                alt="For You"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                DÀNH CHO BẠN
              </span>
            </div>
          </div>

          {/* Lưới sản phẩm dành cho bạn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {errorForYou || errorUserCategories ? (
              // Hiển thị thông báo lỗi nếu không tải được sản phẩm đề xuất
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
                  Không thể tải sản phẩm dành cho bạn
                </h2>
                <p className="text-gray-600 mb-4">
                  {(errorForYou && errorForYou.message) ||
                    (errorUserCategories && errorUserCategories.message) ||
                    "Đã xảy ra lỗi khi tải dữ liệu sản phẩm"}
                </p>
              </div>
            ) : forYouProducts.length === 0 && user?.user_id ? (
              // Hiển thị thông báo khi không có sản phẩm phù hợp
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-4">
                <div className="text-gray-500 mb-4">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Chưa có sản phẩm đề xuất
                </h2>
                <p className="text-gray-600 mb-4">
                  Hãy mua sắm để nhận được đề xuất sản phẩm phù hợp hơn
                </p>
              </div>
            ) : (
              // Hiển thị danh sách sản phẩm đề xuất
              forYouProducts.map((product: Product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            )}
          </div>

          {/* Nút chuyển trang để xem thêm sản phẩm đề xuất */}
          <div className="flex justify-center mb-2">
            <Link
              href={`/customer/category/product?sort=foryou${
                user?.user_id ? `&userId=${user.user_id}` : ""
              }`}
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

          {/* Đường phân cách giữa các phần */}
          <div className="border-t border-black my-4"></div>

          {/* Phần SẢN PHẨM MỚI NHẤT */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-3 py-1 rounded flex items-center">
              <Image
                src="/icon/check-mark.png"
                width={30}
                height={30}
                alt="New"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                SẢN PHẨM MỚI NHẤT
              </span>
            </div>
          </div>

          {/* Lưới sản phẩm mới nhất */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {errorNewest ? (
              // Hiển thị thông báo lỗi nếu không tải được sản phẩm mới nhất
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
                  Không thể tải sản phẩm mới nhất
                </h2>
                <p className="text-gray-600 mb-4">
                  {errorNewest.message ||
                    "Đã xảy ra lỗi khi tải dữ liệu sản phẩm"}
                </p>
              </div>
            ) : (
              // Hiển thị danh sách sản phẩm mới nhất
              newestProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            )}
          </div>

          {/* Nút chuyển trang để xem thêm sản phẩm mới nhất */}
          <div className="flex justify-center mb-2">
            <Link
              href="/customer/category/product?sort=newest"
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

          {/* Đường phân cách giữa các phần */}
          <div className="border-t border-black my-4"></div>

          {/* Phần SẢN PHẨM BÁN CHẠY */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-3 py-1 rounded flex items-center">
              <Image
                src="/icon/fire.png"
                width={30}
                height={30}
                alt="Best Seller"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                SẢN PHẨM BÁN CHẠY
              </span>
            </div>
          </div>

          {/* Lưới sản phẩm bán chạy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {errorBestSeller ? (
              // Hiển thị thông báo lỗi nếu không tải được sản phẩm bán chạy
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
                  Không thể tải sản phẩm bán chạy
                </h2>
                <p className="text-gray-600 mb-4">
                  {errorBestSeller.message ||
                    "Đã xảy ra lỗi khi tải dữ liệu sản phẩm"}
                </p>
              </div>
            ) : (
              // Hiển thị danh sách sản phẩm bán chạy
              bestSellerProducts.map((product: Product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            )}
          </div>

          {/* Nút chuyển trang để xem thêm sản phẩm bán chạy */}
          <div className="flex justify-center mb-2">
            <Link
              href="/customer/category/product?sort=bestseller"
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

          {/* Đường phân cách cuối cùng */}
          <div className="border-t border-black my-4"></div>
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Phần chân trang */}
      <Footer />
    </div>
  );
};

export default HomePage;
