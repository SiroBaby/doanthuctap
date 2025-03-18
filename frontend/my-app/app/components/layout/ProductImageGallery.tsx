"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: Array<{ image_id: number; image_url: string; is_thumbnail: boolean }>;
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
}) => {
  const [selectedImage, setSelectedImage] = useState(
    images.find((img) => img.is_thumbnail)?.image_url || images[0]?.image_url
  );

  return (
    <div className="flex-1">
      <div className="mb-4 relative h-96 w-full">
        <Image
          src={selectedImage || "/icon/product-placeholder.png"}
          alt={productName}
          fill={true}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <div className="flex gap-2 overflow-x-auto justify-center">
        {images.map((image) => (
          <div
            key={image.image_id}
            className={`w-20 h-20 relative border cursor-pointer ${
              selectedImage === image.image_url ? "border-blue-500" : ""
            }`}
            onClick={() => setSelectedImage(image.image_url)}
          >
            <Image
              src={image.image_url}
              alt={`${productName} thumbnail`}
              fill={true}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;