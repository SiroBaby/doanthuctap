'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_USER_VOUCHER_STORAGE } from '@/graphql/queries';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Pagination,
  Chip,
  CircularProgress,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';

interface VoucherStorage {
  voucher_storage_id: string;
  voucher_id: string;
  voucher_type: string;
  claimed_at: string;
  is_used: boolean;
  used_at: string | null;
  __typename: string;
  voucher: {
    id: string;
    code: string;
    discount_percent: number;
    minimum_require_price: number;
    max_discount_price: number;
  } | null;
  shop_voucher: {
    id: string;
    code: string;
    discount_percent: number;
    minimum_require_price: number;
    max_discount_price: number;
    shop_id: string;
  } | null;
}

const UserVoucherPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Get user data from Clerk
  const userId = isLoaded ? user?.id : null;

  // Get user vouchers
  const { loading, error, data } = useQuery(GET_USER_VOUCHER_STORAGE, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Kiểm tra voucher còn hiệu lực hay không
  const isVoucherValid = (voucher: VoucherStorage) => {
    // Kiểm tra voucher đã sử dụng chưa
    if (voucher.is_used) return false;

    // Kiểm tra ngày hết hạn (không hiển thị trong data, nên không thể kiểm tra)
    // Nếu API có thêm trường valid_to, có thể thêm điều kiện kiểm tra sau
    return true;
  };

  // Format discount value
  const formatDiscount = (voucher: VoucherStorage) => {
    if (voucher.voucher_type === 'voucher' && voucher.voucher) {
      return `${voucher.voucher.discount_percent * 100}%`;
    } else if (voucher.voucher_type === 'shopvoucher' && voucher.shop_voucher) {
      return `${voucher.shop_voucher.discount_percent * 100}%`;
    }
    return '';
  };

  if (loading) return (
    <Box className="flex justify-center items-center h-96">
      <CircularProgress />
    </Box>
  );

  if (error) {
    toast.error('Có lỗi xảy ra khi tải voucher');
    return (
      <Box className="p-4">
        <Typography variant="h6" color="error">
          Có lỗi xảy ra khi tải voucher
        </Typography>
      </Box>
    );
  }

  if (!data || !data.getUserVouchersByUserId || data.getUserVouchersByUserId.length === 0) {
    return (
      <Box className="p-8 text-center">
        <LocalOfferIcon style={{ fontSize: 60, color: '#9e9e9e', marginBottom: 16 }} />
        <Typography variant="h5" gutterBottom>
          Bạn chưa lưu voucher nào
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Hãy khám phá và lưu các voucher để nhận ưu đãi
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push('/customer/voucher')}
        >
          Khám phá voucher
        </Button>
      </Box>
    );
  }

  // Get all vouchers
  const allVouchers = data.getUserVouchersByUserId.filter(isVoucherValid);
  
  // Calculate pagination
  const totalPages = Math.ceil(allVouchers.length / itemsPerPage);
  const currentVouchers = allVouchers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box className="p-4 max-w-7xl mx-auto">
      <Typography variant="h4" gutterBottom className="mb-6">
        Voucher của tôi
      </Typography>

      {allVouchers.length === 0 ? (
        <Box className="p-8 text-center">
          <LocalOfferIcon style={{ fontSize: 60, color: '#9e9e9e', marginBottom: 16 }} />
          <Typography variant="h5" gutterBottom>
            Không có voucher hiệu lực
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Bạn không có voucher nào còn hiệu lực
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/customer/voucher')}
          >
            Khám phá voucher
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentVouchers.map((voucher: VoucherStorage) => {
              const voucherType = voucher.voucher_type === 'voucher' ? 'Hệ thống' : 'Shop';
              const voucherTitle = voucher.voucher_type === 'voucher' && voucher.voucher
                ? `Voucher giảm ${voucher.voucher.discount_percent * 100}%` 
                : voucher.shop_voucher 
                  ? `Voucher Shop giảm ${voucher.shop_voucher.discount_percent * 100}%` 
                  : 'Voucher';
              
              const voucherDesc = voucher.voucher_type === 'voucher' && voucher.voucher
                ? `Giảm ${voucher.voucher.discount_percent * 100}% tối đa ${formatCurrency(voucher.voucher.max_discount_price)} cho đơn hàng từ ${formatCurrency(voucher.voucher.minimum_require_price)}`
                : voucher.shop_voucher
                  ? `Giảm ${voucher.shop_voucher.discount_percent * 100}% tối đa ${formatCurrency(voucher.shop_voucher.max_discount_price)} cho đơn hàng từ ${formatCurrency(voucher.shop_voucher.minimum_require_price)}`
                  : '';
              
              const claimedDate = new Date(voucher.claimed_at).toLocaleDateString('vi-VN');
              
              return (
                <Grid item xs={12} key={voucher.voucher_storage_id}>
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box className="flex justify-between items-start">
                            <Box>
                              <Box className="flex items-center mb-1">
                                <Chip 
                                  size="small" 
                                  label={voucherType} 
                                  color={voucher.voucher_type === 'voucher' ? 'primary' : 'secondary'} 
                                  className="mr-2"
                                />
                                <Chip 
                                  size="small" 
                                  label="Có thể sử dụng" 
                                  color="success" 
                                />
                              </Box>
                              <Typography variant="h6" className="mb-1">
                                {voucherTitle}
                              </Typography>
                              <Box className="flex items-center mb-1">
                                <DescriptionIcon fontSize="small" className="mr-1 text-gray-500" />
                                <Typography variant="body2" color="textSecondary">
                                  {voucherDesc}
                                </Typography>
                              </Box>
                              <Box className="flex items-center">
                                <EventIcon fontSize="small" className="mr-1 text-gray-500" />
                                <Typography variant="body2" color="textSecondary">
                                  Đã lưu ngày: {claimedDate}
                                </Typography>
                              </Box>
                            </Box>
                            <Box className="text-right">
                              <Typography variant="h5" color="primary" className="mb-2">
                                {formatDiscount(voucher)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box className="flex justify-center mt-6">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export default UserVoucherPage; 