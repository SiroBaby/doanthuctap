"use client";

import React from "react";
import Image from "next/image";

const Vouchers = () => {
  return (
    <div>
      {/* Voucher 1 */}
      <div className="relative bg-voucher rounded-lg overflow-hidden">
        {/* BLING BLING Á*/}
        {/*<div className="absolute top-0 left-6">  
            <Image src="/icon/star.png" width={30} height={30} alt="Sparkle" />  
        </div>  */}

        <div className="flex flex-col sm:flex-row items-center p-2 sm:p-4">
          <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
            <Image
              src="/icon/voucher-w.png"
              width={80}
              height={60}
              className="w-16 h-auto sm:w-20 md:w-24 lg:w-32"
              alt="Voucher Ticket"
            />
          </div>

          <div className="flex-grow text-center sm:text-left mb-2 sm:mb-0">
            <h3 className="font-bold text-base sm:text-lg">GIẢM TỐI ĐA 30%</h3>
            <p className="font-medium text-sm sm:text-base">
              ĐƠN TỐI THIỂU 100K
            </p>
            <p className="text-xs sm:text-sm">Thời hạn đến 30/12</p>
          </div>

          <div className="flex-shrink-0">
            <button className="bg-button hover:bg-violet-600 text-white px-6 sm:px-8 md:px-11 py-1 sm:py-2 rounded border-collapse border border-black text-sm sm:text-base">
              LƯU
            </button>
          </div>
        </div>
      </div>

      {/* Voucher 2 */}
      <div className="bg-voucher rounded-lg overflow-hidden mt-4">
        <div className="flex flex-col sm:flex-row items-center p-2 sm:p-4">
          <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
            <Image
              src="/icon/voucher-w.png"
              width={80}
              height={60}
              className="w-16 h-auto sm:w-20 md:w-24 lg:w-32"
              alt="Voucher Ticket"
            />
          </div>

          <div className="flex-grow text-center sm:text-left mb-2 sm:mb-0">
            <h3 className="font-bold text-base sm:text-lg">GIẢM TỐI ĐA 10%</h3>
            <p className="font-medium text-sm sm:text-base">ĐƠN TỐI THIỂU 0K</p>
            <p className="text-xs sm:text-sm">Thời hạn đến 31/12</p>
          </div>

          <div className="flex-shrink-0">
            <button className="bg-button hover:bg-violet-600 text-white px-6 sm:px-8 md:px-11 py-1 sm:py-2 rounded border-collapse border border-black text-sm sm:text-base">
              LƯU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
