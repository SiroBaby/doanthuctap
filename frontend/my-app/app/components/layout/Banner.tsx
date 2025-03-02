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
      <div className="relative w-3/6 h-96"> {/* Thiết lập chiều cao cố định */}  
          <Image  
              src={banners[currentIndex]}  
              alt={`Banner Sale ${currentIndex + 1}`}  
              layout="fill"    
              objectFit="cover"   
          />  
      </div>  

      {/* Chấm tròn chỉ định vị trí banner */}  
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">  
          {banners.map((_, index) => (  
              <div  
                key={index}  
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'}`}  
                onClick={() => setCurrentIndex(index)} // Chuyển đến banner tương ứng khi nhấp vào chấm  
              />  
          ))}  
      </div>  
    </div>   
  );  
};  

export default Banner;  