'use client'

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_SHOP_VOUCHER_BY_ID } from '@/graphql/queries';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
    Chip,
    Divider,
    Box,
    Alert,
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment-timezone';

interface ShopVoucherResponse {
    shopVoucher: {
        id: number;
        code: string;
        discount_percent: number;
        minimum_require_price: number;
        max_discount_price: number;
        quantity: number;
        max_use_per_user: number;
        valid_from: string;
        valid_to: string;
        create_at: string;
        delete_at: string | null;
        shop_id: string;
        shop: {
            shop_id: string;
            shop_name: string;
        };
    };
}

const ShopVoucherDetail = () => {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const { data, loading, error } = useQuery<ShopVoucherResponse>(GET_SHOP_VOUCHER_BY_ID, {
        variables: { id },
        fetchPolicy: 'network-only',
    });

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const getVoucherStatus = useCallback((validTo: string, deleteAt: string | null) => {
        if (deleteAt) return { label: 'Đã xóa', color: 'error' as const };
        if (moment(validTo).isBefore(moment())) return { label: 'Đã hết hạn', color: 'warning' as const };
        return { label: 'Đang hoạt động', color: 'success' as const };
    }, []);

    if (loading) {
        return (
            <Box className="flex items-center justify-center h-screen">
                <CircularProgress />
                <Typography className="ml-3">Đang tải thông tin voucher...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="p-6">
                <Alert severity="error" className="mb-4">
                    <Typography variant="h6">Đã xảy ra lỗi!</Typography>
                    <Typography>{error.message}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    if (!data?.shopVoucher) {
        return (
            <Box className="p-6">
                <Alert severity="warning" className="mb-4">
                    <Typography variant="h6">Không tìm thấy voucher</Typography>
                    <Typography>Không thể tìm thấy voucher với ID {id}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    const voucher = data.shopVoucher;
    const status = getVoucherStatus(voucher.valid_to, voucher.delete_at);

    return (
        <Box className="p-6">
            <Box className="flex justify-between items-center mb-6">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" className="font-bold">
                    Chi tiết Voucher
                </Typography>
            </Box>

            <Card className="mb-6">
                <CardContent>
                    <Box className="flex justify-between items-center mb-4">
                        <Typography variant="h5" className="font-bold">
                            Mã Voucher: {voucher.code}
                        </Typography>
                        <Chip
                            label={status.label}
                            color={status.color}
                            className="text-base"
                        />
                    </Box>

                    <Divider className="my-4" />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} className="p-4 bg-gray-50">
                                <Typography variant="subtitle1" className="font-bold mb-2">
                                    Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">ID Voucher:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{voucher.id}</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Phần trăm giảm giá:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{(voucher.discount_percent * 100).toFixed(0)}%</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Giá tối thiểu:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{voucher.minimum_require_price.toLocaleString()} đ</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Giảm tối đa:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{voucher.max_discount_price.toLocaleString()} đ</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Số lượng:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{voucher.quantity}</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Số lần sử dụng tối đa mỗi người:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{voucher.max_use_per_user}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} className="p-4 bg-gray-50">
                                <Typography variant="subtitle1" className="font-bold mb-2">
                                    Thời gian hiệu lực
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Hiệu lực từ:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{moment(voucher.valid_from).format('DD/MM/YYYY HH:mm')}</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Hết hạn:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{moment(voucher.valid_to).format('DD/MM/YYYY HH:mm')}</Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" className="text-gray-600">Thời gian tạo:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{moment(voucher.create_at).format('DD/MM/YYYY HH:mm')}</Typography>
                                    </Grid>

                                    {voucher.delete_at && (
                                        <>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" className="text-gray-600">Thời gian xóa:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{moment(voucher.delete_at).format('DD/MM/YYYY HH:mm')}</Typography>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} className="p-4 bg-gray-50">
                                <Typography variant="subtitle1" className="font-bold mb-2">
                                    Thuộc cửa hàng
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={3} md={2}>
                                        <Typography variant="body2" className="text-gray-600">ID cửa hàng:</Typography>
                                    </Grid>
                                    <Grid item xs={9} md={10}>
                                        <Typography variant="body2">{voucher.shop_id}</Typography>
                                    </Grid>

                                    <Grid item xs={3} md={2}>
                                        <Typography variant="body2" className="text-gray-600">Tên cửa hàng:</Typography>
                                    </Grid>
                                    <Grid item xs={9} md={10}>
                                        <Typography variant="body2">{voucher.shop.shop_name}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box className="mt-6 flex space-x-2 justify-center">
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleBack}
                        >
                            Quay lại
                        </Button>
                        {!voucher.delete_at && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => router.push(`/seller/voucher/edit/${voucher.id}`)}
                            >
                                Chỉnh sửa
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ShopVoucherDetail; 