import AnotherTopBar from "../components/layout/AnotherTopBar";
import ProductCard from "../components/layout/ProductCard";
import Banner from "../components/layout/Banner";
import ProductCategory from "../components/layout/ProductCategory";
import LiveStream from "../components/layout/LiveStream";
import Vouchers from "../components/layout/Vouchers";
//import Video from "../components/layout/Video";
import Footer from "../components/layout/Footer";
import Image from "next/image";
import "../globals.css";

const HomePage: React.FC = () => {
  //mẫu test
  // Tạo mảng 16 sản phẩm mẫu (4 hàng x 4 sản phẩm)
  const sampleProducts = Array(16).fill(null); //hàm array có 16 vị trí chưa có giá trị Array(16) fill(null) điền null vào 16 vị trí đó
  const sampleLiveStream = Array(12).fill(null);
  //const sampleVideo = Array(12).fill(null); // dùng chung với live stream cũng được

  return (
    <div className="w-full">
      <div>
        <AnotherTopBar />
      </div>
      <div>
        <Banner />
      </div>
      <div className="grid grid-cols-12 pt-3 pb-3">
        <div className="col-span-1"></div>
        <div className="col-span-10 bg-white rounded-lg shadow-sm p-4">
          <ProductCategory />
          <section className="mb-8">
            {/* KHO VOUCHER */}
            <div className="flex items-center mb-4">
              <div className="bg-green-300 px-2 py-1 rounded flex items-center">
                <Image
                  src="/icon/voucher.png"
                  width={32}
                  height={32}
                  alt="Voucher"
                  className="mr-2"
                />
                <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                  KHO VOUCHER
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
              <div className="col-span-1 sm:col-span-4 md:col-span-6 lg:col-span-6 space-y-4">
                <Vouchers />
              </div>
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 lg:col-span-2"></div>
            </div>
          </section>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á*/}
          <div className="flex justify-center mb-2">
            <button className="rounded-full" aria-label="button">
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>

          <div className="border-t border-black my-4"></div>

          {/* LIVESTREAMS */}
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-2 py-1 rounded flex items-center">
              <Image
                src="/icon/livestream.png"
                width={32}
                height={32}
                alt="Voucher"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                LIVESTREAM
              </span>
            </div>
          </div>
          {/* Grid sản phẩm: 4 hàng, mỗi hàng 4 sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {sampleLiveStream.map((_, index) => (
              <LiveStream key={index} />
            ))}
          </div>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á*/}
          <div className="flex justify-center mb-2">
            <button className="rounded-full" aria-label="button">
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>

          <div className="border-t border-black my-4"></div>

          {/* VIDEO 
          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-2 py-1 rounded flex items-center">
              <Image
                src="/icon/video.png"
                width={32}
                height={32}
                alt="Voucher"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                VIDEO
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {sampleVideo.map((_, index) => (
              <Video key={index} />
            ))}
          </div>
          */}

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á
            <button className="rounded-full" aria-label="button">
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>

          <div className="border-t border-black my-4"></div>
          */}
          <div className="flex justify-center mb-2"></div>

          <div className="flex items-center mb-4">
            <div className="bg-green-300 px-3 py-1 rounded flex items-center">
              <Image
                src="/icon/shopping-bag.png"
                width={24}
                height={24}
                alt="Cart"
                className="mr-2"
              />
              <span className="text-lg md:text-xl lg:text-2xl text-white font-semibold">
                DÀNH CHO BẠN
              </span>
            </div>
          </div>

          {/* Grid sản phẩm: 4 hàng, mỗi hàng 4 sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {/* sampleProducts.map() lặp qua từng phần tử trong mảng 16 phần tử */}
            {/* (_, index) - Tham số đầu tiên là giá trị phần tử (không sử dụng nên đặt là _), tham số thứ hai là chỉ số index (0-15) */}
            {/* key={index} - Mỗi component cần một thuộc tính key duy nhất để React quản lý hiệu quả việc render lại */}
            {sampleProducts.map((_, index) => (
              <ProductCard key={index} />
            ))}
          </div>

          {/* Nút chuyển trang khi muốn xem nhiều sản phẩm hơn á*/}
          <div className="flex justify-center mb-2">
            <button className="rounded-full" aria-label="button">
              <Image
                src="/icon/button-bar.png"
                width={40}
                height={40}
                alt="button"
              />
            </button>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
