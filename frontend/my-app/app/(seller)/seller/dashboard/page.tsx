'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { GET_SHOP_ID_BY_USER_ID, GET_DASHBOARD_STATS } from '@/graphql/queries';
import {
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  Info,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Type definitions
interface ShopIdResponse {
  getShopIdByUserId: {
    shop_id: string;
  };
}

interface OrderStatusCount {
  waiting_for_delivery: number;
  processed: number;
  delivery: number;
  delivered: number;
  canceled: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface TopSellingProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  product: {
    product_id: number;
    product_name: string;
    product_images: Array<{
      image_url: string;
      is_thumbnail: boolean;
    }>;
  };
}

interface RecentOrder {
  invoice_id: string;
  order_status: string;
  total_amount: number;
  create_at: string;
  user: {
    user_name: string;
  };
}

interface LowStockProduct {
  product_id: number;
  product_name: string;
  status: string;
  product_images: Array<{
    image_url: string;
    is_thumbnail: boolean;
  }>;
  product_variations: Array<{
    product_variation_id: number;
    variation_name: string;
    stock_quantity: number;
  }>;
}

interface DashboardData {
  getDashboardStats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    ordersByStatus: OrderStatusCount;
    revenueByMonth: MonthlyRevenue[];
    topSellingProducts: TopSellingProduct[];
    recentOrders: RecentOrder[];
    lowStockProducts: LowStockProduct[];
  };
}

const COLORS = ['#1FBFEB', '#00E3CD', '#F9F871', '#FF5E5E', '#8884D8'];
const DARK_COLORS = ['#00D2E4', '#00E3CD', '#F9F871', '#FF5E5E', '#8884D8'];

const DashboardPage = () => {
  const { userId } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Fetch shop ID
  const { loading: shopIdLoading } = useQuery<ShopIdResponse>(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.getShopIdByUserId?.shop_id) {
        setShopId(data.getShopIdByUserId.shop_id);
      }
    },
  });

  // Fetch dashboard stats
  const { loading: statsLoading, error: statsError, data: statsData } = useQuery<DashboardData>(
    GET_DASHBOARD_STATS,
    {
      variables: { shop_id: shopId },
      skip: !shopId,
    }
  );

  const isLoading = shopIdLoading || statsLoading;
  
  // Extract data with null checks
  const dashboardStats = statsData?.getDashboardStats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    ordersByStatus: {
      waiting_for_delivery: 0,
      processed: 0,
      delivery: 0,
      delivered: 0,
      canceled: 0
    },
    revenueByMonth: [],
    topSellingProducts: [],
    recentOrders: [],
    lowStockProducts: []
  };

  // Format Vietnamese currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getProductStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting_for_delivery':
        return 'Chờ lấy hàng';
      case 'processed':
        return 'Đã xử lý';
      case 'delivery':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao';
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatOrderStatusData = (data?: OrderStatusCount) => {
    if (!data) return [];
    return [
      { name: getProductStatusLabel('waiting_for_delivery'), value: data.waiting_for_delivery },
      { name: getProductStatusLabel('processed'), value: data.processed },
      { name: getProductStatusLabel('delivery'), value: data.delivery },
      { name: getProductStatusLabel('delivered'), value: data.delivered },
      { name: getProductStatusLabel('canceled'), value: data.canceled },
    ];
  };

  if (!userId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-custom-red/20 dark:bg-custom-red/10 text-custom-red border border-custom-red/20 dark:border-custom-red/30">
          <AlertCircle className="h-5 w-5" />
          <p>Vui lòng đăng nhập để xem thông tin dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none h-[400px] animate-pulse" />
          <div className="md:col-span-1 bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none h-[400px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-custom-red/20 dark:bg-custom-red/10 text-custom-red border border-custom-red/20 dark:border-custom-red/30">
          <AlertCircle className="h-5 w-5" />
          <p>Đã xảy ra lỗi khi tải dữ liệu: {statsError.message}</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-700/30">
          <Info className="h-5 w-5" />
          <p>Không có dữ liệu thống kê cho cửa hàng của bạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">Tổng quan cửa hàng</h1>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6 transition-all hover:shadow-md dark:hover:bg-dark-selected">
          <div className="flex justify-between mb-4">
            <div className="bg-button/10 dark:bg-button/20 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-button" />
            </div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <span>+12.5%</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-1">
            {formatCurrency(dashboardStats.totalRevenue)}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
        </div>

        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6 transition-all hover:shadow-md dark:hover:bg-dark-selected">
          <div className="flex justify-between mb-4">
            <div className="bg-left-anothertopbar/10 dark:bg-left-anothertopbar/20 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-left-anothertopbar" />
            </div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <span>+8.2%</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-1">
            {dashboardStats.totalOrders}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Số đơn hàng</p>
        </div>

        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6 transition-all hover:shadow-md dark:hover:bg-dark-selected">
          <div className="flex justify-between mb-4">
            <div className="bg-right-anothertopbar/10 dark:bg-right-anothertopbar/20 p-3 rounded-full">
              <Package className="h-6 w-6 text-right-anothertopbar" />
            </div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <span>+5.3%</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-1">
            {dashboardStats.totalProducts}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Số sản phẩm</p>
        </div>

        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6 transition-all hover:shadow-md dark:hover:bg-dark-selected">
          <div className="flex justify-between mb-4">
            <div className="bg-button-loc/20 dark:bg-button-loc/10 p-3 rounded-full">
              <Star className="h-6 w-6 text-button-loc" />
            </div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <span>+0.3</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-1">
            {dashboardStats.topSellingProducts.length}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Sản phẩm bán chạy</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly revenue chart */}
        <div className="md:col-span-2 bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6">
            Doanh thu theo tháng
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardStats.revenueByMonth || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#555555' : '#f0f0f0'} 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: isDarkMode ? '#ECECEC' : '#666666' }} 
                  axisLine={{ stroke: isDarkMode ? '#555555' : '#f0f0f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)}
                  tick={{ fill: isDarkMode ? '#ECECEC' : '#666666' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#3C3C3C' : '#fff',
                    border: `1px solid ${isDarkMode ? '#555555' : '#f0f0f0'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ECECEC' : '#333333'
                  }}
                />
                <RechartsLegend wrapperStyle={{ display: 'none' }} />
                <Bar 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  fill={isDarkMode ? '#00D2E4' : '#1FBFEB'} 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product status chart */}
        <div className="md:col-span-1 bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6">
            Trạng thái sản phẩm
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatOrderStatusData(dashboardStats.ordersByStatus)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {formatOrderStatusData(dashboardStats.ordersByStatus).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isDarkMode ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`${value} đơn hàng`, '']}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#3C3C3C' : '#fff',
                    border: `1px solid ${isDarkMode ? '#555555' : '#f0f0f0'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ECECEC' : '#333333'
                  }}
                />
                <RechartsLegend 
                  formatter={(value) => (
                    <span style={{ color: isDarkMode ? '#ECECEC' : '#333333' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders section */}
      <div className="mt-8 bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
            Đơn hàng gần đây
          </h2>
          <button className="text-button hover:text-button/80 text-sm font-medium flex items-center">
            Xem tất cả
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-outline">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-outline">
              {dashboardStats.recentOrders.map((order) => (
                <tr key={order.invoice_id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-dark-text">
                    {order.invoice_id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {order.user.user_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(order.create_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top products section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              Sản phẩm bán chạy
            </h2>
            <button className="text-button hover:text-button/80 text-sm font-medium flex items-center">
              Xem tất cả
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardStats.topSellingProducts.map((product) => (
              <div key={product.product_id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-selected transition-colors">
                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-selected rounded-md flex items-center justify-center">
                  <img src={product.product.product_images[0].image_url} alt={product.product.product_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-dark-text">{product.product.product_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Đã bán: {product.total_quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{formatCurrency(product.total_revenue)}</p>
                  <p className="text-xs text-green-500">+{product.total_quantity * 5}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-body rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-outline p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              Đánh giá gần đây
            </h2>
            <button className="text-button hover:text-button/80 text-sm font-medium flex items-center">
              Xem tất cả
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-selected transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-selected"></div>
                    <p className="ml-2 text-sm font-medium text-gray-800 dark:text-dark-text">Khách hàng {item}</p>
                  </div>
                  <div className="flex items-center">
                    {Array(5).fill(0).map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < (6 - item) ? 'text-button-loc' : 'text-gray-300 dark:text-gray-600'}`} fill={idx < (6 - item) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sản phẩm rất tốt, giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop trong lần tới!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item} ngày trước
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
