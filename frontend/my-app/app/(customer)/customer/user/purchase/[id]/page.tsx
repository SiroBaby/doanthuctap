"use client";

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_INVOICES_BY_USER_ID } from '@/graphql/queries';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Pagination,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
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

interface InvoicesResponse {
  getInvoicesByUserId: {
    data: Invoice[];
    totalCount: number;
    totalPage: number;
  };
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

const ITEMS_PER_PAGE = 10;

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [selectedTab, setSelectedTab] = useState('all');
  const [page, setPage] = useState(1);

  const { loading, error, data } = useQuery<InvoicesResponse>(GET_INVOICES_BY_USER_ID, {
    variables: {
      getInvoicesByUserIdInput: {
        userId,
        page,
        limit: ITEMS_PER_PAGE,
        status: selectedTab === 'all' ? null : selectedTab
      }
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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

  if (error) {
    toast.error('Có lỗi xảy ra khi tải danh sách đơn hàng');
    return <div>Có lỗi xảy ra</div>;
  }

  const orders = data?.getInvoicesByUserId.data || [];
  const totalPages = data?.getInvoicesByUserId.totalPage || 1;

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        Đơn hàng của tôi
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        className="mb-4"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Tất cả" value="all" />
        <Tab label="Chờ xác nhận" value="WAITING_FOR_DELIVERY" />
        <Tab label="Đã xác nhận" value="PROCESSED" />
        <Tab label="Đang giao" value="DELIVERY" />
        <Tab label="Đã giao" value="DELIVERED" />
        <Tab label="Đã hủy" value="CANCELED" />
      </Tabs>

      {loading ? (
        <Box className="flex justify-center items-center py-8">
          <div>Đang tải...</div>
        </Box>
      ) : orders.length === 0 ? (
        <Box className="text-center py-8">
          <Typography variant="h6" color="text.secondary">
            Không có đơn hàng nào
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order.invoice_id}>
                <Card>
                  <CardContent>
                    <Box className="flex justify-between items-center mb-4">
                      <Typography variant="h6">
                        Đơn hàng #{order.invoice_id}
                      </Typography>
                      <Chip
                        label={ORDER_STATUS_MAP[order.order_status]}
                        color={ORDER_STATUS_COLOR[order.order_status]}
                      />
                    </Box>

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

                    <Box className="flex justify-between items-center mt-4">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.create_at)}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" align="right">
                          Tổng tiền: {formatPrice(order.total_amount)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(`/customer/user/purchase/${userId}/${order.invoice_id}`)}
                          className="mt-2"
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box className="flex justify-center mt-4">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
