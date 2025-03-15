'use client'
import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Grid,
    Paper,
    Alert,
    Button,
    Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import moment from 'moment-timezone';

// Define the GraphQL query
const GET_SHOP_VOUCHER_BY_ID = gql`
    query ShopVoucher($id: Int!) {
        shopVoucher(id: $id) {
            id
            shop_id
            code
            discount_percent
            minimum_require_price
            max_discount_price
            quantity
            max_use_per_user
            valid_from
            valid_to
            create_at
            delete_at
        }
    }
`;

interface ShopVoucher {
    id: string;
    shop_id: string;
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
}

interface VoucherResponse {
    shopVoucher: ShopVoucher;
}

const VoucherDetailPage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const voucherId = parseInt(params.id); // Convert id from string to number

    const { data, loading, error } = useQuery<VoucherResponse>(GET_SHOP_VOUCHER_BY_ID, {
        variables: { id: voucherId },
        fetchPolicy: 'network-only',
    });

    const voucher = useMemo(() => data?.shopVoucher, [data]);

    const StatusChip = ({ validTo, deleteAt }: { validTo: string; deleteAt: string | null }) => {
        let status = 'active';
        if (deleteAt) {
            status = 'delete';
        } else if (moment(validTo).isBefore(moment())) {
            status = 'expired';
        }

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'active':
                    return 'success';
                case 'delete':
                    return 'error';
                case 'expired':
                    return 'warning';
                default:
                    return 'default';
            }
        };

        return (
            <Chip
                label={status}
                color={getStatusColor(status)}
            />
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải chi tiết voucher...</Typography>
            </div>
        );
    }

    // Error state
    if (error || !voucher) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Lỗi khi tải dữ liệu</Typography>
                    <Typography>{error?.message || 'Không tìm thấy voucher'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => router.push('/admin/voucher')}
                >
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                <CardContent className="!p-6">
                    <Typography
                        variant="h5"
                        className="!mb-6 !font-bold !text-gray-700 dark:!text-gray-200"
                    >
                        Chi tiết Voucher: {voucher.code}
                    </Typography>

                    <Paper elevation={0} className="!p-4 !bg-gray-50 dark:!bg-dark-selected">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>ID:</strong> {voucher.id}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Shop_ID:</strong> {voucher.shop_id}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Mã Voucher:</strong> {voucher.code}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Phần trăm giảm:</strong> {voucher.discount_percent}%
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Giá tối thiểu:</strong> {voucher.minimum_require_price.toLocaleString()} VNĐ
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Giảm tối đa:</strong> {voucher.max_discount_price.toLocaleString()} VNĐ
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Số lượng:</strong> {voucher.quantity}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Số lần sử dụng tối đa mỗi người:</strong> {voucher.max_use_per_user}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Hiệu lực từ:</strong> {moment(voucher.valid_from).format('DD/MM/YYYY HH:mm')}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Hết hạn:</strong> {moment(voucher.valid_to).format('DD/MM/YYYY HH:mm')}
                                </Typography>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Trạng thái:</strong> <StatusChip validTo={voucher.valid_to} deleteAt={voucher.delete_at} />
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                    <strong>Ngày tạo:</strong> {moment(voucher.create_at).format('DD/MM/YYYY HH:mm')}
                                </Typography>
                                {voucher.delete_at && (
                                    <Typography className="!text-gray-600 dark:!text-gray-300 !mb-2">
                                        <strong>Ngày xóa:</strong> {moment(voucher.delete_at).format('DD/MM/YYYY HH:mm')}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => router.push('/admin/shopvoucher')}
                        >
                            Quay lại danh sách
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VoucherDetailPage;