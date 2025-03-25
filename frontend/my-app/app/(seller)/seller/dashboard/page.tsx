'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SELLER_DASHBOARD_STATS, GET_SHOP_ID_BY_USER_ID, GET_INVOICES_BY_SHOP } from '@/graphql/queries';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  MonetizationOn as MonetizationOnIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/app/utils/format';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';

interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  productCount: number;
  averageRating: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  productStatusCount: Array<{
    status: string;
    count: number;
  }>;
}

interface GetShopIdResponse {
  getShopIdByUserId: {
    shop_id: string;
  };
}

interface Invoice {
  invoice_id: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total_amount: number;
  shipping_fee: number;
  create_at: string;
  user: {
    user_name: string;
    email: string;
    phone: string;
  };
  invoice_products: Array<{
  product_name: string;
    quantity: number;
    price: number;
    variation_name: string;
    product_variation: {
  product_images: Array<{
    image_url: string;
    is_thumbnail: boolean;
  }>;
    };
  }>;
}

interface BestSellingProduct {
  product_name: string;
  variation_name: string;
  quantity: number;
  revenue: number;
  image_url?: string;
}

const COLORS = ['#10b981', '#ef4444']; // Success and Error colors for delivered/canceled

const DashboardPage = () => {
  const { userId } = useAuth();
  const [shopId, setShopId] = useState<string>('');

  // Get shop ID
  const { data: shopData } = useQuery<GetShopIdResponse>(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  useEffect(() => {
    if (shopData?.getShopIdByUserId?.shop_id) {
      setShopId(shopData.getShopIdByUserId.shop_id);
    }
  }, [shopData]);

  // Get dashboard stats
  const { data, loading, error } = useQuery(GET_SELLER_DASHBOARD_STATS, {
    variables: { shopId },
    skip: !shopId,
  });

  // Get recent orders
  const { data: ordersData } = useQuery(GET_INVOICES_BY_SHOP, {
    variables: {
      getInvoicesByShopInput: {
        shop_id: shopId,
        page: 1,
        limit: 5,
      }
    },
    skip: !shopId,
  });

  const stats: DashboardStats = data?.getSellerDashboardStats || {
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0,
    averageRating: 0,
    monthlyRevenue: [],
    productStatusCount: [],
  };

  const recentOrders = ordersData?.getInvoicesByShop?.data || [];

  // Filter only DELIVERED and CANCELED orders
  const filteredStatusCount = stats.productStatusCount.filter(
    status => status.status === 'DELIVERED' || status.status === 'CANCELED'
  ).map(status => ({
    ...status,
    name: status.status === 'DELIVERED' ? 'Đã giao' : 'Đã hủy'
  }));

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: <MonetizationOnIcon className="text-green-500" sx={{ fontSize: 40 }} />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.orderCount,
      icon: <ShoppingCartIcon className="text-blue-500" sx={{ fontSize: 40 }} />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Tổng sản phẩm',
      value: stats.productCount,
      icon: <InventoryIcon className="text-purple-500" sx={{ fontSize: 40 }} />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Đánh giá trung bình',
      value: stats.averageRating.toFixed(1),
      icon: <StarIcon className="text-yellow-500" sx={{ fontSize: 40 }} />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_DELIVERY':
        return <Chip color="warning" label="Chờ lấy hàng" />;
      case 'PROCESSED':
        return <Chip color="info" label="Đã xử lý" />;
      case 'DELIVERY':
        return <Chip color="primary" label="Đang vận chuyển" />;
      case 'DELIVERED':
        return <Chip color="success" label="Đã giao" />;
      case 'CANCELED':
        return <Chip color="error" label="Đã hủy" />;
      default:
        return <Chip label={status} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!userId) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Alert severity="warning">
          Vui lòng đăng nhập để xem thông tin dashboard
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={160} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Alert severity="error">
          Đã xảy ra lỗi khi tải dữ liệu: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8 dark:bg-dark-primary min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold dark:!text-gray-200">
        Tổng quan
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className={`${stat.bgColor} dark:!bg-dark-sidebar border-none shadow-md hover:shadow-lg transition-shadow`}>
              <CardContent>
                <Box className="flex justify-between items-start">
                  <div>
                    <Typography variant="subtitle2" className="mb-1 dark:!text-gray-400">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" className="font-bold dark:!text-gray-200">
                      {stat.value}
                    </Typography>
            </div>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper className="p-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-semibold dark:!text-gray-200">
            Doanh thu theo tháng
            </Typography>
            <Box className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis 
                  dataKey="month" 
                    className="dark:text-gray-400"
                    tickMargin={10}
                />
                <YAxis 
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`;
                      } else if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}K`;
                      }
                      return value;
                    }}
                    className="dark:text-gray-400"
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                <Bar 
                  dataKey="revenue" 
                    fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Order Status */}
        <Grid item xs={12} lg={4}>
          <Paper className="p-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-4 font-semibold dark:!text-gray-200">
              Tỉ lệ đơn hàng thành công
            </Typography>
            <Box className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={filteredStatusCount}
                    dataKey="count"
                    nameKey="name"
                  cx="50%"
                  cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {filteredStatusCount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} đơn`, '']}
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders and Best Selling Products */}
        <Grid container item xs={12} spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} lg={6}>
            <Paper className="p-4 dark:!bg-dark-sidebar h-full">
              <Typography variant="h6" className="mb-4 font-semibold dark:!text-gray-200">
            Đơn hàng gần đây
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="dark:!text-gray-300">Mã đơn hàng</TableCell>
                      <TableCell className="dark:!text-gray-300">Khách hàng</TableCell>
                      <TableCell className="dark:!text-gray-300">Thời gian</TableCell>
                      <TableCell align="right" className="dark:!text-gray-300">Tổng tiền</TableCell>
                      <TableCell align="center" className="dark:!text-gray-300">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order: Invoice) => (
                        <TableRow 
                          key={order.invoice_id}
                          className="hover:bg-gray-50 dark:hover:!bg-dark-hover transition-colors duration-150"
                        >
                          <TableCell className="dark:!text-gray-300">
                    {order.invoice_id}
                          </TableCell>
                          <TableCell className="dark:!text-gray-300">
                            <div>{order.user.user_name}</div>
                            <div className="text-sm text-gray-500">{order.user.email}</div>
                          </TableCell>
                          <TableCell className="dark:!text-gray-300">
                            {formatDate(order.create_at)}
                          </TableCell>
                          <TableCell align="right" className="dark:!text-gray-300">
                    {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(order.order_status)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="dark:!text-gray-400">
                          <Typography variant="body2">
                            Chưa có đơn hàng nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Best Selling Products */}
          <Grid item xs={12} lg={6}>
            <Paper className="p-4 dark:!bg-dark-sidebar h-full">
              <Typography variant="h6" className="mb-4 font-semibold dark:!text-gray-200">
              Sản phẩm bán chạy
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="dark:!text-gray-300">Sản phẩm</TableCell>
                      <TableCell className="dark:!text-gray-300">Phân loại</TableCell>
                      <TableCell align="right" className="dark:!text-gray-300">Số lượng đã bán</TableCell>
                      <TableCell align="right" className="dark:!text-gray-300">Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length > 0 ? (() => {
                      const bestSellingProducts = Object.values(
                        recentOrders.reduce((acc: Record<string, BestSellingProduct>, order: Invoice) => {
                          order.invoice_products.forEach(product => {
                            const key = `${product.product_name}-${product.variation_name}`;
                            if (!acc[key]) {
                              acc[key] = {
                                product_name: product.product_name,
                                variation_name: product.variation_name,
                                quantity: 0,
                                revenue: 0,
                                image_url: product.product_variation?.product_images?.find(img => img.is_thumbnail)?.image_url
                                  || product.product_variation?.product_images?.[0]?.image_url
                              };
                            }
                            acc[key].quantity += product.quantity;
                            acc[key].revenue += product.price * product.quantity;
                          });
                          return acc;
                        }, {})
                      ) as BestSellingProduct[];

                      return bestSellingProducts
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((product, index) => (
                          <TableRow 
                            key={index}
                            className="hover:bg-gray-50 dark:hover:!bg-dark-hover transition-colors duration-150"
                          >
                            <TableCell className="dark:!text-gray-300">
                              <Box className="flex items-center">
                                {product.image_url && (
                                  <Box className="w-12 h-12 mr-3 relative rounded overflow-hidden">
                                    <Image
                                      src={product.image_url}
                                      alt={product.product_name}
                                      fill
                                      style={{ objectFit: 'cover' }}
                                    />
                                  </Box>
                                )}
                                <Typography>{product.product_name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell className="dark:!text-gray-300">
                              {product.variation_name}
                            </TableCell>
                            <TableCell align="right" className="dark:!text-gray-300">
                              {product.quantity}
                            </TableCell>
                            <TableCell align="right" className="dark:!text-gray-300">
                              {formatCurrency(product.revenue)}
                            </TableCell>
                          </TableRow>
                        ));
                    })() : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" className="dark:!text-gray-400">
                          <Typography variant="body2">
                            Chưa có dữ liệu sản phẩm bán chạy
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
