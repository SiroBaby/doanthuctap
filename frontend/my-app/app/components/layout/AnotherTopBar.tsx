import React from 'react';  
import Image from "next/image";  

const AnotherTopBar: React.FC = () => {  
  return (  
    <div className="bg-gradient-to-tr from-left-anothertopbar to-right-anothertopbar p-4">  
      {/* Dòng đầu tiên */}  
      <div className="max-w-7xl mx-auto">  
        <div className="flex items-center justify-between">  
          <div className="flex space-x-6">  
            <span className="text-white cursor-pointer">Kênh người bán</span>  
            <span className="text-white cursor-pointer">Kết nối Facebook</span>  
          </div>  
          <div className="flex items-center space-x-4">  
            <span className="text-white">User</span>  
          </div>  
        </div>  

        {/* Dòng thứ hai */}  
        <div className="flex items-center justify-between mt-2">  
          <div className="font-bold text-white">  
            <Image src="/logo/logodemo.png" width={120} height={0} alt="logo" />  
          </div>  

          <div className="flex justify-center flex-grow mx-4">  
            <div className="relative w-4/6">  
              <input  
                type="text"  
                className="w-full bg-white rounded-full pl-10 pr-10 h-10 border-none outline-none shadow-md"  
                placeholder="Tìm kiếm..."  
              />  
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">  
                <Image src="/icon/search.png" width={20} height={20} alt="search" />  
              </div>  
            </div>  
          </div>  

          <button className="p-2 rounded-full" aria-label="shipping">  
            <Image src="/icon/shopping.png" width={30} height={30} alt="shopping" />  
          </button>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default AnotherTopBar;  