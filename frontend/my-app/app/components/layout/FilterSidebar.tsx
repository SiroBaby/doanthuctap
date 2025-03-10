import React from "react";

const FilterSidebar: React.FC = () => {
  // Các danh mục cố định
  const categories = [
    "Áo khoác",
    "Áo phông",
    "Áo thun",
    "Áo nỉ",
    "Áo bông",
    "Áo lông",
    "Áo rách",
  ];
  const locations = ["Hồ Chí Minh", "Hà Nội", "Cần Thơ", "Đà Nẵng", "Long An"];
  const brands = ["Gucci", "Con Thỏ", "ABC", "MMM", "BBB"];

  return (
    <div className="w-64 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Bộ lọc tìm kiếm</h2>

      {/* danh mục */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Theo danh mục</h3>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-2">
            <input type="checkbox" id={category} className="mr-2 h-4 w-4" />
            <label htmlFor={category} className="text-sm">
              {category}
            </label>
          </div>
        ))}
      </div>

      {/* nơi bán */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Nơi bán</h3>
        {locations.map((location) => (
          <div key={location} className="flex items-center mb-2">
            <input type="checkbox" id={location} className="mr-2 h-4 w-4" />
            <label htmlFor={location} className="text-sm">
              {location}
            </label>
          </div>
        ))}
      </div>

      {/* thương hiệu */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Thương hiệu</h3>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-2">
            <input type="checkbox" id={brand} className="mr-2 h-4 w-4" />
            <label htmlFor={brand} className="text-sm">
              {brand}
            </label>
          </div>
        ))}
      </div>
      <div className="pb-8">
        <button className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors">
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
