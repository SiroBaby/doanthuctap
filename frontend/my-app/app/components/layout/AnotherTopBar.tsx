import React from 'react';

const AnotherTopBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-tr from-left-anothertopbar to-right-anothertopbar p-4" >
      {/* First Row */}
      <div className="max-w-7xl mx-auto" >
        <div className="flex items-center justify-between" >
          <div className="flex space-x-6" >
            <span className="text-white cursor-pointer" > Kênh người bán </span>
            <span className="text-white cursor-pointer" > Kết nối Facebook </span>
          </div>
          <div className="flex items-center space-x-4" >
            <span className="text-white" > User </span>
            < img src="/path/to/cart-icon.svg" alt="cart" className="w-6 h-6" />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex items-center justify-between flex-grow mx-4 mt-2" >
          <div className="font-bold text-white mr-2" > Logo </div>
          < input
            type="text"
            className="flex-grow p-2 rounded-full border-none outline-none"
            placeholder="Tìm kiếm..."
          />
          <button className="p-2 bg-white rounded-full ml-2" >
            <img src="/path/to/search-icon.svg" alt="search" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnotherTopBar;  