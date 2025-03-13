import React from "react";
import Image from "next/image";
import ProductOrderInfo from "@/app/components/layout/ProductOrderInfo";
import ProductsSeller from "@/app/components/layout/ProductsSeller";
import ProductDetail from "@/app/components/layout/ProductDetails";
import ProductDescription from "@/app/components/layout/ProductDescription";
import ProductReview from "@/app/components/layout/ProductReview";
import ProductCard from "@/app/components/layout/ProductCard";

const Page = () => {
  const sampleProducts = Array(12).fill(null);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-3">
        {/* Product Image Gallery */}
        <div className="flex-1">
          <div className="mb-4 relative h-96 w-full">
            <Image
              src="/icon/ao-to.png"
              alt="Áo thun nữ PLAY GAME"
              fill={true}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <div className="flex gap-2 overflow-x-auto justify-center">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="w-20 h-20 relative border cursor-pointer"
              >
                <Image
                  src={`/icon/ao ${num}.png`}
                  alt={`Thumbnail ${num}`}
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Order Info */}
        {/* phần này để hiện dữ liệu mẫu thui*/}
        {/* Khi call API đổ dữ liệu trực tiếp ở trang này chứ không làm ở ProductOrderInfo */}
        <div className="flex-1">
          <ProductOrderInfo
            productName="Áo thun nam nữ PLAY GAME - Áo thun unisex 100% cotton 2 chiều"
            brandName="Đánh giá"
            price={165000}
            colors={["Đen", "Trắng", "Xanh", "Hồng", "Vàng", "Xám"]}
            sizes={["S", "M", "L", "XL", "XXL", "3XL"]}
          />
        </div>
      </div>
      {/* Phần thông tin người bán */}
      <div className="mt-4 pb-4">
        <ProductsSeller
          sellerName="littlebrother"
          sellerAvatar="/logo/avt-capy.png"
          sellerShopUrl="/shop/littlebrother"
        />
      </div>

      <div className=" bg-white p-3">
        <ProductDetail />
      </div>
      <div className=" bg-white p-3">
        <ProductDescription />
      </div>
      <div className="bg-white mt-4">
        <ProductReview />
      </div>

      <div className="flex items-center mt-4 mb-4">
        <div className="bg-green-300 px-3 py-1 rounded flex items-center">
          <Image
            src="/icon/shopping-bag.png"
            width={24}
            height={24}
            alt="Cart"
            className="mr-2"
          />
          <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
            SẢN PHẨM KHÁC CỦA SHOP
          </span>
        </div>
      </div>

      {/* Grid sản phẩm: 3 hàng, mỗi hàng 4 sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {sampleProducts.map((_, index) => (
          <ProductCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default Page;
