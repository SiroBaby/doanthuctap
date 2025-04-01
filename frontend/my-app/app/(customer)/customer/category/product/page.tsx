"use client";

import React, { useState, useEffect } from "react";
import FilterSidebar from "@/app/components/layout/FilterSidebar";
import ProductCard from "@/app/components/layout/ProductCard";
import { useQuery } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { GET_PRODUCTS_FOR_HOMEPAGE } from "@/graphql/queries";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";

// Định nghĩa các interface cho dữ liệu sản phẩm
/**
 * Interface mô tả cấu trúc hình ảnh của sản phẩm
 * @property image_url - Đường dẫn đến hình ảnh
 * @property is_thumbnail - Đánh dấu có phải là ảnh đại diện hay không
 */
interface ProductImage {
  image_url: string;
  is_thumbnail: boolean;
}

/**
 * Interface mô tả biến thể của sản phẩm
 * @property base_price - Giá gốc của sản phẩm
 * @property percent_discount - Phần trăm giảm giá (từ 0 đến 1)
 */
interface ProductVariation {
  base_price: number;
  percent_discount: number;
}

/**
 * Interface mô tả cấu trúc đầy đủ của một sản phẩm
 * @property product_id - ID duy nhất của sản phẩm
 * @property product_name - Tên sản phẩm
 * @property product_images - Mảng chứa các hình ảnh của sản phẩm
 * @property product_variations - Mảng chứa các biến thể của sản phẩm (kích cỡ, màu sắc...)
 * @property category - Thông tin danh mục của sản phẩm (tùy chọn)
 * @property create_at - Thời gian tạo sản phẩm (tùy chọn)
 * @property total_sales - Tổng số lượng đã bán (tùy chọn)
 * @property brand - Thương hiệu sản phẩm (tùy chọn)
 */
interface Product {
  product_id: number;
  product_name: string;
  product_images: ProductImage[];
  product_variations: ProductVariation[];
  category?: {
    category_id: number;
  };
  create_at?: string;
  total_sales?: number;
  brand?: string;
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
 * Các tùy chọn sắp xếp sản phẩm
 * - newest: Sản phẩm mới nhất
 * - bestseller: Sản phẩm bán chạy nhất
 * - price_asc: Giá tăng dần
 * - price_desc: Giá giảm dần
 * - foryou: Sản phẩm được đề xuất cho người dùng
 */
type SortOption =
  | "newest"
  | "bestseller"
  | "price_asc"
  | "price_desc"
  | "foryou";

/**
 * Component trang danh sách sản phẩm
 *
 * Component này hiển thị danh sách sản phẩm với các tùy chọn lọc và sắp xếp.
 * Hỗ trợ tìm kiếm, lọc theo danh mục, thương hiệu và sắp xếp theo nhiều tiêu chí.
 */
const ProductPage = () => {
  // Khởi tạo các hook cần thiết
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  // Lấy các thông số từ URL
  const searchTerm = searchParams.get("search") || "";
  const categoryId = searchParams.get("category");
  const categoryName = searchParams.get("categoryName");
  const sortParam = (searchParams.get("sort") || "newest") as SortOption;
  const userId = searchParams.get("userId");
  const selectedCategories =
    searchParams.get("category")?.split(",").map(Number) || [];
  const selectedBrands = searchParams.get("brands")?.split(",") || [];
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 30; // Số sản phẩm hiển thị trên mỗi trang là 30 sản phẩm

  // State để quản lý tiêu chí sắp xếp
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);

  // Cập nhật sortBy khi URL thay đổi
  useEffect(() => {
    setSortBy(sortParam);
  }, [sortParam]);

  /**
   * Chuyển hướng về trang chủ
   * Được gọi khi người dùng nhấp vào liên kết "Home" trong breadcrumb
   */
  const navigateToHome = () => {
    router.push("/");
  };

  // Gọi API để lấy danh sách sản phẩm sử dụng Apollo Client
  const { loading, error, data } = useQuery<ProductsResponse>(
    GET_PRODUCTS_FOR_HOMEPAGE,
    {
      variables: {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryId ? parseInt(categoryId) : undefined,
        sort: sortParam,
        userId: userId || user?.user_id,
      },
    }
  );

  /**
   * Tạo dữ liệu mẫu khi chưa có dữ liệu thật từ API
   * Sẽ hiển thị khi đang tải dữ liệu hoặc khi có lỗi từ API
   */
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
      create_at: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      total_sales: Math.floor(Math.random() * 1000),
    }));

  // Sử dụng dữ liệu thật nếu có, nếu không sẽ dùng dữ liệu mẫu
  const allProducts = data?.products?.data || sampleProducts;

  // Lọc sản phẩm theo danh mục đã chọn
  const filteredByCategories =
    selectedCategories.length > 0
      ? allProducts.filter((product) =>
          selectedCategories.includes(product.category?.category_id || 0)
        )
      : allProducts;

  // Lọc sản phẩm theo thương hiệu đã chọn
  const filteredByBrands =
    selectedBrands.length > 0
      ? filteredByCategories.filter((product) =>
          selectedBrands.includes(product.brand || "")
        )
      : filteredByCategories;

  /**
   * Sắp xếp sản phẩm dựa trên tiêu chí đã chọn
   * - newest: Sắp xếp theo thời gian tạo (mới nhất lên đầu)
   * - bestseller: Sắp xếp theo số lượng bán (cao nhất lên đầu)
   * - price_asc: Sắp xếp theo giá tăng dần
   * - price_desc: Sắp xếp theo giá giảm dần
   * - foryou: (Xử lý đặc biệt ở backend, không cần sắp xếp ở frontend)
   */
  const sortedProducts = [...filteredByBrands].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.create_at || "").getTime() -
          new Date(a.create_at || "").getTime()
        );
      case "bestseller":
        return (b.total_sales || 0) - (a.total_sales || 0);
      case "price_asc":
        return (
          (a.product_variations[0]?.base_price || 0) -
          (b.product_variations[0]?.base_price || 0)
        );
      case "price_desc":
        return (
          (b.product_variations[0]?.base_price || 0) -
          (a.product_variations[0]?.base_price || 0)
        );
      default:
        return 0;
    }
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(
    (data?.products?.totalCount || 0) / itemsPerPage
  );

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/customer/category/product?${params.toString()}`);
  };

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-blue-500 pb-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-1"></div>
        <div className="col-span-10">
          {/* Thanh điều hướng breadcrumb */}
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-gray-500">
              <button
                onClick={navigateToHome}
                className="hover:text-blue-600 cursor-pointer"
              >
                Home
              </button>
              <span className="mx-2">/</span>
              <span>Danh sách sản phẩm</span>
              {categoryName && (
                <>
                  <span className="mx-2">/</span>
                  <span>{categoryName}</span>
                </>
              )}
              {searchTerm && (
                <>
                  <span className="mx-2">/</span>
                  <span>Kết quả tìm kiếm: {searchTerm}</span>
                </>
              )}
              {sortParam === "foryou" && (
                <>
                  <span className="mx-2">/</span>
                  <span>Dành cho bạn</span>
                </>
              )}
            </div>
          </div>

          {/* Hiển thị thông báo khi không tìm thấy sản phẩm nào trong danh mục */}
          {categoryId && sortedProducts.length === 0 && (
            <div className="bg-white p-4 mb-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">
                Không tìm thấy sản phẩm nào trong danh mục này.
              </p>
            </div>
          )}

          {/* Thanh công cụ sắp xếp sản phẩm */}
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between">
              {/* Nút sắp xếp theo tiêu chí khác nhau */}
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-gray-700">Sắp xếp theo:</span>
                <div className="flex space-x-1">
                  {/* Nút sắp xếp theo sản phẩm mới nhất */}
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      sortBy === "newest"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => {
                      setSortBy("newest");
                      router.push("/customer/category/product?sort=newest");
                    }}
                  >
                    Mới nhất
                  </button>
                  {/* Nút sắp xếp theo sản phẩm bán chạy */}
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                      sortBy === "bestseller"
                        ? "bg-button-loc text-black font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => {
                      setSortBy("bestseller");
                      router.push("/customer/category/product?sort=bestseller");
                    }}
                  >
                    Bán chạy
                  </button>
                  {/* Nút sắp xếp theo đề xuất cá nhân (chỉ hiển thị khi đã đăng nhập) */}
                  {user && (
                    <button
                      className={`px-3 py-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-button-loc active:transform active:scale-95 ${
                        sortBy === "foryou"
                          ? "bg-button-loc text-black font-medium"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => {
                        setSortBy("foryou");
                        router.push(
                          `/customer/category/product?sort=foryou&userId=${user.user_id}`
                        );
                      }}
                    >
                      Dành cho bạn
                    </button>
                  )}
                </div>
              </div>

              {/* Lọc sản phẩm theo giá */}
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Giá:</span>
                <select
                  id="price-filter"
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:border-blue-500"
                  aria-label="Lọc theo giá"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="price_asc">Thấp đến cao</option>
                  <option value="price_desc">Cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bố cục chính của trang */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Thanh bên trái chứa các bộ lọc */}
            <div className="md:col-span-3">
              <div className="rounded-lg shadow-sm pt-4">
                <FilterSidebar />
              </div>
            </div>

            {/* Phần hiển thị danh sách sản phẩm */}
            <div className="md:col-span-9">
              <div className="pt-4">
                {loading ? (
                  // Hiển thị skeleton loading khi đang tải dữ liệu
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
                  // Hiển thị thông báo lỗi khi gọi API thất bại
                  <div className="text-center text-red-500">
                    Error loading products
                  </div>
                ) : (
                  // Hiển thị lưới sản phẩm
                  <div className="grid grid-cols-3 gap-4">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.product_id} product={product} />
                    ))}
                  </div>
                )}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  {/* Nút Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Trang trước"
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-button-loc text-black hover:bg-button-loc"
                    }`}
                  >
                    <Image
                      src="/icon/left-arrow.png"
                      alt="Previous"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>

                  {/* Các số trang */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      title={`Trang ${page}`}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-button-loc text-black"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Nút Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-button-loc text-black hover:bg-button-loc"
                    }`}
                  >
                    <Image
                      src="/icon/right-arrow.png"
                      alt="Next"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default ProductPage;
