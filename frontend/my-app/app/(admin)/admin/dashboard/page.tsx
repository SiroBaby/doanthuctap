'use client';

import { useQuery } from '@apollo/client';
import { GET_ADMIN_DASHBOARD_STATS } from '@/graphql/queries';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { formatCurrency } from '@/app/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Image from 'next/image';

interface TopSellingProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  product: {
    product_images: {
      image_url: string;
      is_thumbnail: boolean;
    }[];
    shop: {
      shop_name: string;
    };
  };
}

interface TopShop {
  shop_id: number;
  shop_name: string;
  total_revenue: number;
  total_orders: number;
  total_products: number;
}

interface RecentOrder {
  invoice_id: string;
  order_status: string;
  total_amount: number;
  user: {
    user_name: string;
  };
}

// Status chip component
const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_DELIVERY':
        return 'warning';
      case 'PROCESSED':
        return 'info';
      case 'DELIVERY':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_DELIVERY':
        return 'Chờ lấy hàng';
      case 'PROCESSED':
        return 'Đã xử lý';
      case 'DELIVERY':
        return 'Đang vận chuyển';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'}
      size="small"
    />
  );
};

const DashboardPage = () => {
  const { loading, error, data } = useQuery(GET_ADMIN_DASHBOARD_STATS);

  if (loading) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error">
          <Typography variant="h6">Lỗi khi tải dữ liệu</Typography>
          <Typography>{error.message}</Typography>
        </Alert>
      </Container>
    );
  }

  const stats = data?.getAdminDashboardStats;

  // Sắp xếp dữ liệu doanh thu theo tháng
  const sortedRevenueData = [...stats.revenueByMonth].sort((a, b) => {
    const [monthA, yearA] = a.month.split('-');
    const [monthB, yearB] = b.month.split('-');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="mb-6 font-bold text-gray-800 dark:text-dark-text">
        Tổng quan hệ thống
      </Typography>

      <Grid container spacing={3}>
        {/* Thống kê tổng quan */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Tổng doanh thu
                  </Typography>
                  <Typography variant="h4" className="mt-1 font-bold text-gray-800 dark:text-dark-text">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
                <Box className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white">
                  <TrendingUpIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Tổng đơn hàng
                  </Typography>
                  <Typography variant="h4" className="mt-1 font-bold text-gray-800 dark:text-dark-text">
                    {stats.totalOrders}
                  </Typography>
                </Box>
                <Box className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center text-white">
                  <ShoppingCartIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Tổng cửa hàng
                  </Typography>
                  <Typography variant="h4" className="mt-1 font-bold text-gray-800 dark:text-dark-text">
                    {stats.totalShops}
                  </Typography>
                </Box>
                <Box className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center text-white">
                  <StoreIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h4" className="mt-1 font-bold text-gray-800 dark:text-dark-text">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Box className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white">
                  <PeopleIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Biểu đồ doanh thu theo tháng */}
        <Grid item xs={12}>
          <Paper className="p-6 !bg-white dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-bold text-gray-800 dark:text-dark-text">
              Doanh thu theo tháng
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    tickFormatter={(value) => {
                      const [month] = value.split('-');
                      return `Tháng ${parseInt(month)}`;
                    }}
                  />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => {
                      const [month, year] = label.split('-');
                      return `Tháng ${parseInt(month)}/${year}`;
                    }}
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Thống kê đơn hàng theo trạng thái */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 !bg-white dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-6 font-bold text-gray-800 dark:text-dark-text">
              Thống kê đơn hàng
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                  Chờ lấy hàng
                </Typography>
                <Typography variant="h6" className="font-bold text-gray-800 dark:text-dark-text">
                  {stats.orderStats.waiting_for_delivery}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                  Đã xử lý
                </Typography>
                <Typography variant="h6" className="font-bold text-gray-800 dark:text-dark-text">
                  {stats.orderStats.processed}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                  Đang vận chuyển
                </Typography>
                <Typography variant="h6" className="font-bold text-gray-800 dark:text-dark-text">
                  {stats.orderStats.delivery}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                  Đã giao
                </Typography>
                <Typography variant="h6" className="font-bold text-gray-800 dark:text-dark-text">
                  {stats.orderStats.delivered}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                  Đã hủy
                </Typography>
                <Typography variant="h6" className="font-bold text-gray-800 dark:text-dark-text">
                  {stats.orderStats.canceled}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Top sản phẩm bán chạy */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 !bg-white dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-bold text-gray-800 dark:text-dark-text">
              Top sản phẩm bán chạy
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="!font-bold !text-gray-700 dark:!text-gray-300">Sản phẩm</TableCell>
                    <TableCell align="right" className="!font-bold !text-gray-700 dark:!text-gray-300">Số lượng</TableCell>
                    <TableCell align="right" className="!font-bold !text-gray-700 dark:!text-gray-300">Doanh thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topSellingProducts.map((product: TopSellingProduct) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <Box className="flex items-center">
                          <Box className="w-10 h-10 mr-3 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.product.product_images.find((img) => img.is_thumbnail)?.image_url || '/placeholder.jpg'}
                              alt={product.product_name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" className="font-medium text-gray-800 dark:text-dark-text line-clamp-1">
                              {product.product_name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.product.shop.shop_name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" className="!text-gray-600 dark:!text-gray-300">
                        {product.total_quantity}
                      </TableCell>
                      <TableCell align="right" className="!text-gray-600 dark:!text-gray-300">
                        {formatCurrency(product.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top cửa hàng */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 !bg-white dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-bold text-gray-800 dark:text-dark-text">
              Top cửa hàng
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="!font-bold !text-gray-700 dark:!text-gray-300">Cửa hàng</TableCell>
                    <TableCell align="right" className="!font-bold !text-gray-700 dark:!text-gray-300">Đơn hàng</TableCell>
                    <TableCell align="right" className="!font-bold !text-gray-700 dark:!text-gray-300">Doanh thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topShops.map((shop: TopShop) => (
                    <TableRow key={shop.shop_id}>
                      <TableCell className="!text-gray-600 dark:!text-gray-300 line-clamp-1">
                        {shop.shop_name}
                      </TableCell>
                      <TableCell align="right" className="!text-gray-600 dark:!text-gray-300">
                        {shop.total_orders}
                      </TableCell>
                      <TableCell align="right" className="!text-gray-600 dark:!text-gray-300">
                        {formatCurrency(shop.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Đơn hàng gần đây */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 !bg-white dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-bold text-gray-800 dark:text-dark-text">
              Đơn hàng gần đây
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="!font-bold !text-gray-700 dark:!text-gray-300">Mã đơn</TableCell>
                    <TableCell className="!font-bold !text-gray-700 dark:!text-gray-300">Khách hàng</TableCell>
                    <TableCell className="!font-bold !text-gray-700 dark:!text-gray-300">Trạng thái</TableCell>
                    <TableCell align="right" className="!font-bold !text-gray-700 dark:!text-gray-300">Tổng tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentOrders.map((order: RecentOrder) => (
                    <TableRow key={order.invoice_id}>
                      <TableCell className="!text-gray-600 dark:!text-gray-300">
                        {order.invoice_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="!text-gray-600 dark:!text-gray-300 line-clamp-1">
                        {order.user.user_name}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={order.order_status} />
                      </TableCell>
                      <TableCell align="right" className="!text-gray-600 dark:!text-gray-300">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;