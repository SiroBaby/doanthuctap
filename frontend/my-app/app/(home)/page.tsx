//import Image from 'next/image';
//import { FaTicketAlt, FaTshirt, FaShoes, FaDesktop, FaMobile, FaClock, FaMicrochip, FaMousePointer } from 'react-icons/fa';
import AnotherTopBar from '../components/layout/AnotherTopBar';
//import ProductCard from '../components/layout/ProductCard'; 
import Banner from '../components/layout/Banner';
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

    </div>

  );
};

export default HomePage;