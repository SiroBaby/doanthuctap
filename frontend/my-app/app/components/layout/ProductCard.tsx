"use client";

import React, { useState } from "react";
import Image from "next/image";

const ProductCard = () => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden max-w-xs transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
      onMouseLeave={() => {
        setIsButtonPressed(false);
      }}
    >
      <div className="relative h-25">
        <Image
          src="/icon/ao.png"
          width={200}
          height={200}
          alt="Áo phông trắng"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative p-3 h-24">
        <p className="text-gray-800 font-medium">Áo phông trắng</p>
        <p className="text-blue-500 font-bold mt-1">100.000</p>

        <button
          className={`absolute bottom-7 right-5 bg-button-shopping rounded-full p-3
                     transition-all duration-200 ease-in-out
                     ${
                       isButtonPressed
                         ? "scale-90 shadow-inner"
                         : "hover:scale-110 hover:shadow-lg"
                     }`}
          aria-label="Thêm vào giỏ hàng"
          onMouseDown={() => setIsButtonPressed(true)}
          onMouseUp={() => setIsButtonPressed(false)}
          onMouseLeave={() => setIsButtonPressed(false)}
        >
          <Image
            src="/icon/shopping-b.png"
            width={30}
            height={30}
            alt="shopping"
            className="transition-transform duration-200"
          />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
