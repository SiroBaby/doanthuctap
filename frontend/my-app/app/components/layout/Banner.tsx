"use client";   

import React, { useState, useEffect } from 'react';  
import Image from 'next/image';  

const Banner = () => {  
  const banners = [  
    "/banner/banner_home1.png",  
    "/banner/capybara.png",  
    "/banner/capybara-thumb.jpg",  
  ];  

  const [currentIndex, setCurrentIndex] = useState(0);  

  const nextBanner = () => {  
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);  
  };  

  // Thiết lập timer để tự động chuyển banner  
  useEffect(() => {  
    const timer = setInterval(() => {  
      nextBanner();  
    }, 5000); // Thay đổi banner mỗi 5 giây  

    return () => clearInterval(timer); // Dọn dẹp timer khi component bị unmount  
  }, []); // Chỉ chạy một lần khi component được mount  

  return (  
    <div className="flex justify-center flex-grow relative">  
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-3/6 h-48 sm:h-64 md:h-80 lg:h-96 mx-4 sm:mx-auto"> 
        {/* Container có kích thước responsive */}  
        <Image  
          src={banners[currentIndex]}  
          alt={`Banner Sale ${currentIndex + 1}`}  
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 75vw, 50vw"
          style={{
            objectFit: "cover",
            objectPosition: "center"
          }}
          priority
        />  
      </div>  

      {/* Chấm tròn chỉ định vị trí banner */}  
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">  
        {banners.map((_, index) => (  
          <div  
            key={index}  
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-all duration-300 ${
              currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'
            }`}  
            onClick={() => setCurrentIndex(index)}
            role="button"
            aria-label={`Xem banner ${index + 1}`}
          />  
        ))}  
      </div>  
    </div>   
  );  
};  

export default Banner;