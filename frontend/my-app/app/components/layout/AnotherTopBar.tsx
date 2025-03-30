"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
//import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import { GET_CART, GET_CART_PRODUCTS, GET_PRODUCTS } from "@/graphql/queries";
import { debounce } from "lodash";

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
  category: {
    category_name: string;
  };
  shop: {
    shop_name: string;
  };
}

const AnotherTopBar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const apolloClient = useApolloClient();
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [executeSearch, { loading }] = useLazyQuery(GET_PRODUCTS);

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

  // Xử lý click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length >= 2) {
      try {
        const { data } = await executeSearch({
          variables: {
            page: 1,
            limit: 5,
            search: term,
          },
        });
        setSuggestions(data?.products?.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/customer/category/product?search=${encodeURIComponent(searchTerm)}`
      );
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    router.push(`/customer/category/product/${product.product_id}`);
    setShowSuggestions(false);
    setSearchTerm("");
    setSuggestions([]);
  };

  // Xử lý khi click vào nút giỏ hàng
  const handleCartClick = async () => {
    if (userId) {
      try {
        await apolloClient.cache.evict({ fieldName: "getcart" });
        await apolloClient.cache.evict({ fieldName: "getCartProducts" });
        await apolloClient.cache.gc();

        const { data: cartData } = await apolloClient.query({
          query: GET_CART,
          variables: { id: userId },
          fetchPolicy: "network-only",
        });

        if (cartData?.getcart?.cart_id) {
          await apolloClient.query({
            query: GET_CART_PRODUCTS,
            variables: { cart_id: cartData.getcart.cart_id },
            fetchPolicy: "network-only",
          });
        }

        router.push(`/customer/shoppingcart/${userId}`);
      } catch (error) {
        console.error("Error refreshing cart data:", error);
        router.push(`/customer/shoppingcart/${userId}`);
      }
    }
  };

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
                <span
                  className="text-white font-bold shadow-text cursor-pointer"
                  onClick={() =>
                    router.push(`/customer/user/profile/${userId}`)
                  }
                >
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
            <div className="relative w-4/6" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="w-full bg-white rounded-full pl-10 pr-10 h-10 border-none outline-none shadow-md"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  title="Tìm kiếm"
                >
                  <Image
                    src="/icon/search.png"
                    width={20}
                    height={20}
                    alt="search"
                  />
                </button>
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">Đang tải...</div>
                  ) : (
                    suggestions.map((product) => (
                      <div
                        key={product.product_id}
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(product)}
                      >
                        <div className="font-medium text-gray-800">
                          {product.product_name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button className="p-2 rounded-full" aria-label="shopping">
            <Image
              src="/icon/shopping.png"
              width={30}
              height={30}
              alt="shopping"
              onClick={handleCartClick}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnotherTopBar;
