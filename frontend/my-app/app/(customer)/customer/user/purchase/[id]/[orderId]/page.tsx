/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderDetail from "@/app/components/purchase/OrderDetail";
import { useQuery, useMutation } from '@apollo/client';
import { GET_INVOICE_DETAIL } from '@/graphql/queries';
import { UPDATE_INVOICE_STATUS } from '@/graphql/mutations';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface InvoiceProduct {
  invoice_product_id: string;
  product_name: string;
  variation_name: string;
  price: number;
  quantity: number;
  discount_percent: number;
  product_variation: {
    product_images: {
      image_url: string;
      is_thumbnail: boolean;
    }[];
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
  shipping_address: {
    address: string;
    phone: string;
  };
  invoice_products: InvoiceProduct[];
}

interface InvoiceDetailResponse {
  getInvoiceDetail: Invoice;
}

const ORDER_STATUS_MAP: { [key: string]: string } = {
  'WAITING_FOR_DELIVERY': 'Chờ xác nhận',
  'PROCESSED': 'Đã xác nhận',
  'DELIVERY': 'Đang giao hàng',
  'DELIVERED': 'Đã giao hàng',
  'CANCELED': 'Đã hủy'
};

const ORDER_STATUS_COLOR: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
  'WAITING_FOR_DELIVERY': 'warning',
  'PROCESSED': 'info',
  'DELIVERY': 'primary',
  'DELIVERED': 'success',
  'CANCELED': 'error'
};

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const { loading, error, data, refetch } = useQuery<InvoiceDetailResponse>(GET_INVOICE_DETAIL, {
    variables: { invoice_id: orderId },
  });

  const [updateInvoiceStatus] = useMutation(UPDATE_INVOICE_STATUS, {
    onCompleted: () => {
      toast.success('Đã hủy đơn hàng thành công');
      refetch();
      setOpenCancelDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    },
  });

  const handleCancelOrder = async () => {
    try {
      await updateInvoiceStatus({
        variables: {
          updateInvoiceStatusInput: {
            invoice_id: orderId,
            order_status: 'CANCELED'
          }
        }
      });
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getThumbnailImage = (product: InvoiceProduct) => {
    const thumbnail = product.product_variation.product_images.find(img => img.is_thumbnail);
    return thumbnail ? thumbnail.image_url : product.product_variation.product_images[0]?.image_url;
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) {
    toast.error('Có lỗi xảy ra khi tải thông tin đơn hàng');
    return <div>Có lỗi xảy ra</div>;
  }
  if (!data) return <div>Không tìm thấy đơn hàng</div>;

  const order = data.getInvoiceDetail;
  const canCancel = order.order_status === 'WAITING_FOR_DELIVERY';

  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Chi tiết đơn hàng #{order.invoice_id}
        </Typography>
        <Box className="flex items-center gap-4">
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenCancelDialog(true)}
            >
              Hủy
            </Button>
          )}
          <Chip
            label={ORDER_STATUS_MAP[order.order_status]}
            color={ORDER_STATUS_COLOR[order.order_status]}
            size="medium"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Sản phẩm đã mua
              </Typography>
              {order.invoice_products.map((product) => (
                <Box key={product.invoice_product_id} className="flex gap-4 mb-4 border-b pb-4">
                  <Box className="relative w-24 h-24">
                    <Image
                      src={getThumbnailImage(product)}
                      alt={product.product_name}
                      fill
                      className="object-cover rounded"
                    />
                  </Box>
                  <Box className="flex-grow">
                    <Typography variant="subtitle1">
                      {product.product_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phân loại: {product.variation_name}
                    </Typography>
                    <Typography variant="body2">
                      x{product.quantity}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {formatPrice(product.price * (1 - product.discount_percent / 100))}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Thông tin đơn hàng
              </Typography>
              <Box className="space-y-2">
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng:
                  </Typography>
                  <Typography variant="body2">
                    {order.invoice_id}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Ngày đặt hàng:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(order.create_at)}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body2">
                    {order.payment_method}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái thanh toán:
                  </Typography>
                  <Typography variant="body2">
                    {order.payment_status}
                  </Typography>
                </Box>
              </Box>

              <Divider className="my-4" />

              <Typography variant="h6" className="mb-4">
                Thông tin giao hàng
              </Typography>
              <Box className="space-y-2">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Người nhận:
                  </Typography>
                  <Typography variant="body2">
                    {order.user.user_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping_address.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ:
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping_address.address}
                  </Typography>
                </Box>
              </Box>

              <Divider className="my-4" />

              <Box className="space-y-2">
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền hàng:
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(order.total_amount - order.shipping_fee)}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    Phí vận chuyển:
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(order.shipping_fee)}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="subtitle1">
                    Tổng thanh toán:
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    {formatPrice(order.total_amount)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </Grid>
      </Grid>

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetailPage;
