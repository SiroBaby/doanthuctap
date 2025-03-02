//import Image from 'next/image';
//import { FaTicketAlt, FaTshirt, FaShoes, FaDesktop, FaMobile, FaClock, FaMicrochip, FaMousePointer } from 'react-icons/fa';
import AnotherTopBar from '../components/layout/AnotherTopBar';
//import ProductCard from '../components/layout/ProductCard'; 
import Banner from '../components/layout/Banner';
import ProductCategory from '../components/layout/ProductCategory';
//import Image from "next/image";  
import "../globals.css";

const HomePage: React.FC = () => {

  return (
    <div className="w-full">
      <div>
        <AnotherTopBar />
      </div>
      <div>
        <Banner/>
      </div>
      <div>
        <ProductCategory/>

      {/* KHO VOUCHER  
            <section className="mb-8">  
              <h2 className="text-2xl font-semibold mb-4 text-green-500">KHO VOUCHER</h2>  
              <div className="space-y-4">  
                {/* Voucher 1 
                <div className="flex items-center p-4 bg-blue-100 rounded-lg">  
                  <div className="flex items-center">  
                    <Image src="/icons/voucher-icon.svg" width={20} height={20} alt="Voucher" />  
                    <div>  
                      <h3 className="font-semibold">GIẢM TỚI 30%</h3>  
                      <p>Đơn tối thiểu 100K</p>  
                      <p className="text-sm text-gray-600">Thời hạn đến 30/12</p>  
                    </div>  
                  </div>  
                  <button className="ml-auto bg-blue-500 text-white px-4 py-2 rounded">LƯU</button>  
                </div>  
                
                {/* Voucher 2 
                <div className="flex items-center p-4 bg-green-100 rounded-lg">  
                  <div className="flex items-center">  
                    <Image src="/icons/voucher-icon.svg" width={20} height={20} alt="Voucher" />  
                    <div>  
                      <h3 className="font-semibold">GIẢM TỚI 10%</h3>  
                      <p>Đơn tối thiểu 0K</p>  
                      <p className="text-sm text-gray-600">Thời hạn đến 31/12</p>  
                    </div>  
                  </div>  
                  <button className="ml-auto bg-blue-500 text-white px-4 py-2 rounded">LƯU</button>  
                </div>  
              </div>  
            </section>  */} 
      
        </div>
    </div>

  );
};

export default HomePage;