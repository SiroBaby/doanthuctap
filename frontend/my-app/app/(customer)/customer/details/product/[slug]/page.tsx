"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { GET_PRODUCT_BY_ID } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import ProductOrderInfo from "@/app/components/layout/ProductOrderInfo";
import ProductsSeller from "@/app/components/layout/ProductsSeller";
import ProductDetail from "@/app/components/layout/ProductDetails";
import ProductDescription from "@/app/components/layout/ProductDescription";

interface ProductDetailData {
  product: {
    product_id: number;
    product_name: string;
    brand: string;
    status: string;
    category: {
      category_name: string;
    };
    shop: {
      shop_id: string;
      shop_name: string;
      link: string;
    };
    product_detail: {
      description: string;
      specifications: string;
    };
    product_variations: Array<{
      product_variation_id: number;
      product_variation_name: string;
      base_price: number;
      percent_discount: number;
      stock_quantity: number;
      status: string;
    }>;
    product_images: Array<{
      image_id: number;
      image_url: string;
      is_thumbnail: boolean;
    }>;
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const str = slug?.toString().split("-");
  const id = parseInt(str[str.length - 1]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<{
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  } | null>(null);

  const { loading, error, data } = useQuery<ProductDetailData>(GET_PRODUCT_BY_ID, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if (data?.product?.product_images?.length) {
      const thumbnailImage = data.product.product_images.find(
        (img) => img.is_thumbnail
      );
      setSelectedImage(
        thumbnailImage?.image_url || data.product.product_images[0].image_url
      );
    }
    if (data?.product?.product_variations?.length) {
      const initialVariation = data.product.product_variations[0];
      setSelectedVariation({
        name: initialVariation.product_variation_name,
        basePrice: initialVariation.base_price,
        percentDiscount: initialVariation.percent_discount,
        stock_quantity: initialVariation.stock_quantity,
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <p>Error loading product: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  const product = data.product;
  const variations = product.product_variations.map((v) => ({
    product_variation_id: v.product_variation_id,
    name: v.product_variation_name,
    basePrice: v.base_price,
    percentDiscount: v.percent_discount,
    stock_quantity: v.stock_quantity,
  }));

  const handleVariationChange = (variation: {
    name: string;
    basePrice: number;
    percentDiscount: number;
    stock_quantity: number;
  }) => {
    setSelectedVariation(variation);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString("vi-VN");
  };

  const discountedPrice = selectedVariation
    ? selectedVariation.basePrice * (1 - selectedVariation.percentDiscount)
    : 0;

  const displayPercentDiscount = selectedVariation
    ? selectedVariation.percentDiscount * 100
    : 0;

  const productDetails = {
    category: product.category?.category_name || "",
    warehouse: product.product_variations
      .reduce((total, variation) => total + variation.stock_quantity, 0)
      .toString(),
    brand: product.brand || "",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-3">
        {/* Product Image Gallery */}
        <div className="flex-1">
          <div className="mb-4 relative h-96 w-full">
            <Image
              src={selectedImage || "/icon/product-placeholder.png"}
              alt={product.product_name}
              fill={true}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <div className="flex gap-2 overflow-x-auto justify-center">
            {product.product_images.map((image) => (
              <div
                key={image.image_id}
                className={`w-20 h-20 relative border cursor-pointer ${
                  selectedImage === image.image_url ? "border-blue-500" : ""
                }`}
                onClick={() => setSelectedImage(image.image_url)}
              >
                <Image
                  src={image.image_url}
                  alt={`${product.product_name} thumbnail`}
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Order Info */}
        <div className="flex-1">
          <ProductOrderInfo
            productName={product.product_name}
            brandName={product.brand}
            variations={variations}
            onVariationChange={handleVariationChange}
          />
        </div>
      </div>

      {/* Hiển thị thông tin giá */}
      <div className="mt-4 p-3 bg-white">
        <h2 className="text-lg font-semibold">Thông tin giá</h2>
        {selectedVariation && (
          <div className="text-sm">
            <p>Phân loại: {selectedVariation.name}</p>
            <p>
              Giá gốc:{" "}
              <span className="line-through italic">
                {formatPrice(selectedVariation.basePrice)} ₫
              </span>
            </p>
            <p>Phần trăm giảm giá: {displayPercentDiscount}%</p>
            <p>Giá sau giảm: {formatPrice(discountedPrice)} ₫</p>
            <p>Kho: {selectedVariation.stock_quantity} sản phẩm</p>
          </div>
        )}
      </div>

      {/* Shop information */}
      <div className="mt-4 pb-4">
        <ProductsSeller
          sellerName={product.shop.shop_name}
          sellerAvatar={"/logo/avt-capy.png"}
          sellerShopUrl={`/shop/${product.shop.shop_id}`}
        />
      </div>

      <div className="bg-white p-3">
        <ProductDetail productData={productDetails} />
      </div>

      <div className="bg-white p-3">
        <ProductDescription
          productDescription={product.product_detail?.description}
          productImage={product.product_images.map((img) => img.image_url)}
        />
      </div>
    </div>
  );
}