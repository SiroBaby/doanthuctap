"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/graphql/queries";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  brand: string;
}

interface ProductsResponse {
  products: {
    data: Product[];
  };
}

const FilterSidebar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // State for filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Fetch products to get brands
  const { data: productsData } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 100,
      search: searchTerm,
    },
  });

  // Get unique brands from products
  const brands = Array.from(
    new Set(
      productsData?.products.data
        .map((product) => product.brand)
        .filter((brand): brand is string => !!brand)
    )
  );

  // Handle brand selection
  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update brand filter
    if (selectedBrands.length > 0) {
      params.set("brands", selectedBrands.join(","));
    } else {
      params.delete("brands");
    }

    router.push(`/customer/category/product?${params.toString()}`);
  };

  return (
    <div className="w-64 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Bộ lọc tìm kiếm</h2>

      {/* Brands */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Thương hiệu</h3>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`brand-${brand}`}
              className="mr-2 h-4 w-4"
              checked={selectedBrands.includes(brand)}
              onChange={() => handleBrandChange(brand)}
            />
            <label
              htmlFor={`brand-${brand}`}
              className="text-sm cursor-pointer"
            >
              {brand}
            </label>
          </div>
        ))}
      </div>

      <div className="pb-8">
        <button
          className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors"
          onClick={applyFilters}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
