/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_INVOICE_DETAIL } from '@/graphql/queries';
import { UPDATE_INVOICE_STATUS } from '@/graphql/mutations';
import { OrderStatus, InvoiceProduct, ShippingAddress } from '../../types';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Link from 'next/link';

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
  };
}

const InvoiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  
  // Fetch invoice detail
  const { loading, error, data, refetch } = useQuery<InvoiceDetailResponse>(GET_INVOICE_DETAIL, {
    variables: { invoice_id: invoiceId },
    skip: !invoiceId,
  });
  
  // Update invoice status mutation
  const [updateInvoiceStatus, { loading: updatingStatus }] = useMutation(UPDATE_INVOICE_STATUS, {
    onCompleted: () => {
      refetch();
      setConfirmDialogOpen(false);
      setNextStatus(null);
    },
  });
  
  // Handle action button click
  const handleActionClick = (status: OrderStatus) => {
    setNextStatus(status);
    setConfirmDialogOpen(true);
  };
  
  // Handle confirm dialog
  const handleConfirm = () => {
    if (invoiceId && nextStatus) {
      updateInvoiceStatus({
        variables: {
          updateInvoiceStatusInput: {
            invoice_id: invoiceId,
            order_status: nextStatus,
          },
        },
      });
    }
  };
  
  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setNextStatus(null);
  };
  
  // Get status chip
  const getStatusChip = (status: string) => {
    switch (status) {
      case OrderStatus.WAITING_FOR_DELIVERY:
        return <Chip color="warning" label="Chờ lấy hàng" />;
      case OrderStatus.PROCESSED:
        return <Chip color="info" label="Đã xử lý" />;
      case OrderStatus.DELIVERY:
        return <Chip color="primary" label="Đang vận chuyển" />;
      case OrderStatus.DELIVERED:
        return <Chip color="success" label="Đã giao" />;
      case OrderStatus.CANCELED:
        return <Chip color="error" label="Đã hủy" />;
      default:
        return <Chip label={status} />;
    }
  };
  
  // Get next action button
  const getNextActionButton = (currentStatus: string) => {
    switch (currentStatus) {
      case OrderStatus.WAITING_FOR_DELIVERY:
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleActionClick(OrderStatus.PROCESSED)}
          >
            Chuẩn bị hàng
          </Button>
        );
      case OrderStatus.PROCESSED:
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LocalShippingIcon />}
            onClick={() => handleActionClick(OrderStatus.DELIVERY)}
          >
            Vận chuyển
          </Button>
        );
      case OrderStatus.DELIVERY:
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleActionClick(OrderStatus.DELIVERED)}
          >
            Đã giao hàng
          </Button>
        );
      default:
        return null;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
  
  // Format date
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
  
  // Calculate product price with discount
  const calculatePrice = (price: number, discountPercent: number) => {
    return price * (1 - discountPercent / 100);
  };
  
  if (loading) {
    return (
      <Container className="py-6">
        <Box className="mb-6">
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={30} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-6">
        <Alert severity="error">
          Đã xảy ra lỗi khi tải dữ liệu: {error.message}
        </Alert>
      </Container>
    );
  }
  
  if (!data?.getInvoiceDetail) {
    return (
      <Container className="py-6">
        <Alert severity="warning">
          Không tìm thấy thông tin đơn hàng
        </Alert>
      </Container>
    );
  }
  
  const invoice = data.getInvoiceDetail;
  const products = invoice.invoice_products || [];
  
  // Tính tổng tiền sản phẩm (đã bao gồm giảm giá)
  const total = products.reduce((sum, product) => {
    const price = product.price || 0;
    const quantity = product.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  return (
    <Container className="py-6 dark:bg-dark-primary min-h-screen">
      <Box className="mb-6">
        <Breadcrumbs aria-label="breadcrumb" className="mb-4">
          <Link href="/seller/order" passHref>
            <MuiLink underline="hover" className="dark:!text-gray-300">
              Quản lý đơn hàng
            </MuiLink>
          </Link>
          <Typography className="dark:!text-gray-400">Chi tiết đơn hàng</Typography>
        </Breadcrumbs>
        
        <Box className="flex justify-between items-center mb-4">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold dark:!text-gray-200">
              Chi tiết đơn hàng
            </Typography>
            <Typography className="dark:!text-gray-400">
              Mã đơn hàng: {invoice.invoice_id}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            className="dark:!text-gray-300 dark:!border-gray-600"
          >
            Quay lại
          </Button>
        </Box>
        
        <Box className="flex items-center mb-4">
          <Typography variant="body1" className="mr-2 dark:!text-gray-300">
            Trạng thái:
          </Typography>
          {getStatusChip(invoice.order_status)}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="p-4 mb-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-3 font-semibold dark:!text-gray-200">
              Thông tin đơn hàng
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Ngày đặt hàng
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {formatDate(invoice.create_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Phương thức thanh toán
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {invoice.payment_method || 'Thanh toán khi nhận hàng'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Trạng thái thanh toán
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {invoice.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper className="p-4 mb-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-3 font-semibold dark:!text-gray-200">
              Thông tin khách hàng
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Tên khách hàng
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {invoice.user.user_name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Số điện thoại
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {invoice.shipping_address?.phone || 'Không có'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" className="dark:text-dark-text">
                  Địa chỉ giao hàng
                </Typography>
                <Typography variant="body1" className="font-medium dark:!text-gray-200">
                  {invoice.shipping_address?.address || 'Không có'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper className="p-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-3 font-semibold dark:text-dark-text">
              Sản phẩm
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell  className="dark:text-dark-text">Sản phẩm</TableCell>
                    <TableCell align="center" className="dark:text-dark-text">Đơn giá</TableCell>
                    <TableCell align="center" className="dark:text-dark-text">Số lượng</TableCell>
                    <TableCell align="right" className="dark:text-dark-text">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => {
                    const price = product.price || 0;
                    const discountPercent = product.discount_percent || 0;
                    // Chỉ tính discountedPrice nếu cần hiển thị
                    const productTotal = calculatePrice(price, discountPercent) * product.quantity;
                    const imageUrl = product.product_variation?.product_images?.find(img => img.is_thumbnail)?.image_url
                      || product.product_variation?.product_images?.[0]?.image_url;
                    
                    return (
                      <TableRow key={product.invoice_product_id || index}>
                        <TableCell>
                          <Box className="flex items-center">
                            {imageUrl ? (
                              <Box className="w-16 h-16 mr-3 relative">
                                <Image
                                  src={imageUrl}
                                  alt={product.product_name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  className="rounded"
                                />
                              </Box>
                            ) : (
                              <Box className="w-16 h-16 mr-3 bg-gray-200 rounded flex items-center justify-center">
                                <ReceiptIcon />
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body1" className="font-medium dark:text-dark-text">
                                {product.product_name}
                              </Typography>
                              <Typography variant="body2" className="dark:text-dark-text">
                                {product.variation_name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography variant="body2" className="font-medium !text-inherit dark:!text-dark-text">
                              {formatCurrency(price)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" className="!text-inherit dark:!text-dark-text">
                          {product.quantity}
                        </TableCell>
                        <TableCell align="right" className="!text-inherit dark:!text-dark-text">
                          {formatCurrency(total)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper className="p-4 mb-4 dark:!bg-dark-sidebar">
            <Typography variant="h6" className="mb-3 font-semibold dark:!text-gray-200">
              Tóm tắt đơn hàng
            </Typography>
            
            <Box className="mb-2 flex justify-between">
              <Typography variant="body1" className="dark:!text-gray-300">Tạm tính</Typography>
              <Typography variant="body1" className="dark:!text-gray-200">{formatCurrency(total)}</Typography>
            </Box>
            
            <Box className="mb-2 flex justify-between">
              <Typography variant="body1" className="dark:!text-gray-300">Phí vận chuyển</Typography>
              <Typography variant="body1" className="dark:!text-gray-200">{formatCurrency(invoice.shipping_fee)}</Typography>
            </Box>
            
            <Divider className="my-3" />
            
            <Box className="mb-2 flex justify-between">
              <Typography variant="h6" className="dark:!text-gray-300">Tổng cộng</Typography>
              <Typography variant="h6" className="font-bold dark:!text-gray-200">
                {formatCurrency(invoice.total_amount + invoice.shipping_fee)}
              </Typography>
            </Box>
          </Paper>
          
          {invoice.order_status !== OrderStatus.DELIVERED && 
           invoice.order_status !== OrderStatus.CANCELED && (
            <Paper className="p-4 dark:!bg-dark-sidebar">
              <Typography variant="h6" className="mb-3 font-semibold dark:!text-gray-200">
                Thao tác
              </Typography>
              
              <Box className="flex flex-col gap-2">
                {getNextActionButton(invoice.order_status)}
                
                {invoice.order_status !== OrderStatus.CANCELED && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleActionClick(OrderStatus.CANCELED)}
                    className="dark:!text-gray-300 dark:!border-gray-600"
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này thành{' '}
            {nextStatus === OrderStatus.PROCESSED && 'Đã xử lý'}
            {nextStatus === OrderStatus.DELIVERY && 'Đang vận chuyển'}
            {nextStatus === OrderStatus.DELIVERED && 'Đã giao hàng'}
            {nextStatus === OrderStatus.CANCELED && 'Đã hủy'} không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" disabled={updatingStatus}>
            {updatingStatus ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceDetailPage; 