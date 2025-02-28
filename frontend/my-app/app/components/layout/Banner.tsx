"use client"; // Thêm dòng này để chỉ định đây là Client Component  

import React, { useState } from 'react';  
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

  const prevBanner = () => {  
    setCurrentIndex((prevIndex) =>   
      (prevIndex - 1 + banners.length) % banners.length  
    );  
  };  

  return (  
    <div className="flex justify-center flex-grow relative">  
      <div className="relative w-3/6">  
          <Image  
              src={banners[currentIndex]}  
              alt={`Banner Sale ${currentIndex + 1}`}  
              layout="responsive"   
              width={0}   
              height={0}  
          />  
      </div>  

      {/* Nút Previous */}  
      <button   
        onClick={prevBanner}   
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow"  
      >  
        &#10094;  
      </button>  
      
      {/* Nút Next */}  
      <button   
        onClick={nextBanner}   
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow"  
      >  
        &#10095;  
      </button>  
    </div>   
  );  
};  

export default Banner;  