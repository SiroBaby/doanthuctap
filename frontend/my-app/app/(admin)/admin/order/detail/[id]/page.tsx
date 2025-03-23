'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_INVOICE_DETAIL } from '@/graphql/queries';
import Image from 'next/image';

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/app/utils/format';

interface InvoiceProduct {
  invoice_product_id: number;
  product_name: string;
  variation_name: string;
  price: number;
  quantity: number;
  discount_percent: number;
  product_variation_id: number;
  product_variation?: {
    product_images?: {
      image_url: string;
      is_thumbnail: boolean;
    }[];
  };
}

interface ShippingAddress {
  address: string;
  phone: string;
}

interface InvoiceDetailResponse {
  getInvoiceDetail: {
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
    shipping_address: ShippingAddress;
    invoice_products: InvoiceProduct[];
    products: {
      product_variation_name: string;
      base_price: number;
      percent_discount: number;
      status: string;
      product_name: string;
      shop_id: string;
      shop_name: string;
      image_url: string;
      quantity: number;
    }[];
  };
}

// Status chip component
const StatusChip = ({ status }: { status: string }) => {
  // Handle null status
  const normalizedStatus = status === null ? 'WAITING_FOR_DELIVERY' : status;

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
      label={getStatusLabel(normalizedStatus)}
      color={getStatusColor(normalizedStatus) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'}
      size="medium"
    />
  );
};

// Payment status chip
const PaymentStatusChip = ({ status }: { status: string }) => {
  // Handle null status
  const normalizedStatus = status === null ? 'pending' : status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusLabel(normalizedStatus)}
      color={getStatusColor(normalizedStatus) as 'warning' | 'success' | 'error' | 'default'}
      size="medium"
    />
  );
};

const InvoiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  // Fetch invoice detail
  const { loading, error, data } = useQuery<InvoiceDetailResponse>(GET_INVOICE_DETAIL, {
    variables: { invoice_id: invoiceId },
    skip: !invoiceId,
  });
  
  // Calculate total price with discount
  const calculatePrice = (price: number, discountPercent: number) => {
    return price * (1 - discountPercent / 100);
  };
  
  // Get product thumbnail
  const getProductThumbnail = (product: InvoiceProduct) => {
    // Tìm sản phẩm tương ứng trong mảng products
    const matchingProduct = data?.getInvoiceDetail?.products.find(
      p => p.product_name === product.product_name && p.product_variation_name === product.variation_name
    );
    
    // Sử dụng image_url từ products nếu có, không thì dùng placeholder
    return matchingProduct?.image_url || '/placeholder-image.jpg';
  };
  
  // Handle back button
  const handleBack = () => {
    router.push('/admin/order');
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box className="flex flex-col space-y-4">
          <Skeleton variant="rectangular" height={50} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error">
          <Typography variant="h6">Lỗi khi tải chi tiết đơn hàng</Typography>
          <Typography>{error.message || 'Đã xảy ra lỗi không xác định'}</Typography>
        </Alert>
      </Container>
    );
  }
  
  // No data state
  if (!data?.getInvoiceDetail) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="info">
          <Typography>Không tìm thấy thông tin đơn hàng</Typography>
        </Alert>
      </Container>
    );
  }
  
  const invoice = data.getInvoiceDetail;
  
  return (
    <div className="p-6">
      <Box className="mb-6">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          <MuiLink component={Link} href="/admin/order" color="inherit">
            Quản lý đơn hàng
          </MuiLink>
          <Typography color="text.primary">Chi tiết đơn hàng {invoice.invoice_id}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        className="mb-6"
      >
        Quay lại danh sách
      </Button>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h5" className="font-bold !text-gray-700 dark:!text-gray-200">
                  Thông tin đơn hàng #{invoice.invoice_id}
                </Typography>
                <Box>
                  <StatusChip status={invoice.order_status} />
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper className="p-4 !bg-gray-50 dark:!bg-dark-paper">
                    <Typography variant="h6" className="font-semibold mb-2 !text-gray-700 dark:!text-gray-200">
                      Thông tin khách hàng
                    </Typography>
                    <Divider className="mb-3" />
                    <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                      <strong>Họ tên:</strong> {invoice.user.user_name}
                    </Typography>
                    <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                      <strong>Email:</strong> {invoice.user.email}
                    </Typography>
                    <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                      <strong>Số điện thoại:</strong> {invoice.user.phone || 'Không có'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper className="p-4 !bg-gray-50 dark:!bg-dark-paper">
                    <Typography variant="h6" className="font-semibold mb-2 !text-gray-700 dark:!text-gray-200">
                      Thông tin giao hàng
                    </Typography>
                    <Divider className="mb-3" />
                    <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                      <strong>Địa chỉ:</strong> {invoice.shipping_address?.address || 'Không có'}
                    </Typography>
                    <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                      <strong>Số điện thoại:</strong> {invoice.shipping_address?.phone || 'Không có'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper className="p-4 !bg-gray-50 dark:!bg-dark-paper">
                    <Typography variant="h6" className="font-semibold mb-2 !text-gray-700 dark:!text-gray-200">
                      Thông tin thanh toán
                    </Typography>
                    <Divider className="mb-3" />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                          <strong>Phương thức thanh toán:</strong> {invoice.payment_method || 'Không có'}
                        </Typography>
                        <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                          <strong>Trạng thái thanh toán:</strong> <PaymentStatusChip status={invoice.payment_status} />
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography className="!text-gray-600 dark:!text-gray-300 mb-1">
                          <strong>Ngày đặt hàng:</strong> {formatDate(invoice.create_at)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card className="!bg-white dark:!bg-dark-sidebar">
            <CardContent>
              <Typography variant="h5" className="font-bold mb-4 !text-gray-700 dark:!text-gray-200">
                Sản phẩm đã đặt
              </Typography>
              
              <TableContainer component={Paper} className="!bg-transparent">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200">Sản phẩm</TableCell>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200">Phiên bản</TableCell>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="center">Số lượng</TableCell>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="right">Đơn giá</TableCell>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="right">Giảm giá</TableCell>
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.invoice_products.map((product) => {
                      const discountedPrice = calculatePrice(product.price, product.discount_percent);
                      return (
                        <TableRow key={product.invoice_product_id}>
                          <TableCell>
                            <Box className="flex items-center">
                              <Box className="w-16 h-16 mr-3 relative bg-gray-100 flex-shrink-0">
                                <Image
                                  src={getProductThumbnail(product)}
                                  alt={product.product_name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </Box>
                              <Typography className="!text-gray-600 dark:!text-gray-300">
                                {product.product_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell className="!text-gray-600 dark:!text-gray-300">
                            {product.variation_name}
                          </TableCell>
                          <TableCell className="!text-gray-600 dark:!text-gray-300" align="center">
                            {product.quantity}
                          </TableCell>
                          <TableCell className="!text-gray-600 dark:!text-gray-300" align="right">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell className="!text-gray-600 dark:!text-gray-300" align="right">
                            {product.discount_percent}%
                          </TableCell>
                          <TableCell className="!text-gray-600 dark:!text-gray-300" align="right">
                            {formatCurrency(discountedPrice * product.quantity)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={4} />
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="right">
                        Phí vận chuyển:
                      </TableCell>
                      <TableCell className="!text-gray-600 dark:!text-gray-300" align="right">
                        {formatCurrency(invoice.shipping_fee)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} />
                      <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200" align="right">
                        Tổng cộng:
                      </TableCell>
                      <TableCell className="!font-bold !text-xl !text-primary dark:!text-primary" align="right">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default InvoiceDetailPage; 