'use client';
import React, { useState, useCallback, useMemo} from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Chip,
    IconButton,
    Box,
    Grid,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_SHOP_BY_ID } from '@/graphql/queries';
import moment from 'moment-timezone';
import Image from 'next/image';

// Định nghĩa interface cho dữ liệu từ GraphQL
interface ShopAddress {
    address_id: string;
    shop_id: string;
    address: string;
    phone: string;
}

interface ProductImage {
    image_url: string;
    is_thumbnail: boolean;
}

interface Product {
    product_id: string;
    product_name: string;
    brand: string;
    status: string;
    product_images: ProductImage[];
}

interface ShopVoucher {
    id: number;
    code: string;
    discount_percent: number;
    valid_from: Date;
    valid_to: Date;
    minimum_require_price: number;
    max_discount_price: number;
}

interface User {
    id_user: string;
    user_name: string;
}

interface Location {
    location_id: string;
    location_name: string;
}

interface ShopResponse {
    shop: {
        shop_id: string;
        id_user: string;
        shop_name: string;
        link: string;
        status: string;
        location_id: string;
        create_at: Date;
        update_at: Date;
        delete_at: Date | null;
        shop_addresses: ShopAddress[];
        products: Product[];
        user: User;
        shop_vouchers: ShopVoucher[];
        location: Location;
    };
}

const ShopDetailPage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [shopId] = useState(params.id);
    const [productIndex, setProductIndex] = useState(0); // Quản lý vị trí hiển thị sản phẩm
    const [voucherIndex, setVoucherIndex] = useState(0); // Quản lý vị trí hiển thị voucher

    const { data, loading, error } = useQuery<ShopResponse>(GET_SHOP_BY_ID, {
        variables: { id: shopId },
        fetchPolicy: 'network-only'
    });

    console.log("Shop Id", shopId)

    const shop = useMemo(() => data?.shop || null, [data]);
    const productsPerPage = 5; // Hiển thị 5 sản phẩm mỗi lần
    const totalProducts = shop?.products?.length || 0;
    const maxProductIndex = Math.max(0, Math.ceil(totalProducts / productsPerPage) - 1);

    const vouchersPerPage = 5; // Hiển thị 5 voucher mỗi lần
    const totalVouchers = shop?.shop_vouchers?.length || 0;
    const maxVoucherIndex = Math.max(0, Math.ceil(totalVouchers / vouchersPerPage) - 1);

    const handleViewProduct = useCallback((productId: string) => {
        router.push(`/admin/product/detail/${productId}`);
    }, [router]);

    const handleViewUser = useCallback((userId: string) => {
        router.push(`/admin/user/detail/${userId}`);
    }, [router]);

    const handleNextProducts = () => {
        if (productIndex < maxProductIndex) {
            setProductIndex(productIndex + 1);
        }
    };

    const handlePrevProducts = () => {
        if (productIndex > 0) {
            setProductIndex(productIndex - 1);
        }
    };

    const handleNextVouchers = () => {
        if (voucherIndex < maxVoucherIndex) {
            setVoucherIndex(voucherIndex + 1);
        }
    };

    const handlePrevVouchers = () => {
        if (voucherIndex > 0) {
            setVoucherIndex(voucherIndex - 1);
        }
    };

    const handleViewVoucher = useCallback((id: number) => {
        router.push(`/admin/shopvoucher/detail/${id}`);
    }, [router])

    const StatusChip = ({ status }: { status: string }) => {
        const normalizedStatus = status === null ? 'active' : status;

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'active':
                    return 'success';
                case 'delete':
                    return 'error';
                default:
                    return 'default';
            }
        };

        return (
            <Chip
                label={normalizedStatus}
                color={getStatusColor(normalizedStatus)}
                className="!bg-green-500 !text-white"
                sx={{
                    backgroundColor: normalizedStatus === 'active' ? '#34C759' : '#FF3B30',
                }}
            />
        );
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải chi tiết cửa hàng...</Typography>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Lỗi khi tải dữ liệu cửa hàng</Typography>
                    <Typography>{error?.message || 'Không tìm thấy cửa hàng'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => router.back()}
                    className="!bg-button !text-white"
                >
                    Quay lại
                </Button>
            </div>
        );
    }

    const visibleProducts = shop.products.slice(
        productIndex * productsPerPage,
        (productIndex + 1) * productsPerPage
    );

    const visibleVouchers = shop.shop_vouchers.slice(
        voucherIndex * vouchersPerPage,
        (voucherIndex + 1) * vouchersPerPage
    );

    return (
        <div className="p-6 min-h-screen">
            <Typography variant="h4" className="mb-6 !text-gray-700 dark:!text-dark-text !font-bold">
                Chi tiết cửa hàng: {shop.shop_name}
            </Typography>

            {/* Thông tin cửa hàng - Dùng Grid để trực quan hơn */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Thông tin cửa hàng
            </Typography>
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg mb-6">
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                ID:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300 truncate">{shop.shop_id}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Tên cửa hàng:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">{shop.shop_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Link:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">{shop.link || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Trạng thái:
                            </Typography>
                            <StatusChip status={shop.status} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Ngày tạo:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                {moment(shop.create_at).format('DD/MM/YYYY HH:mm')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Ngày cập nhật:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                {moment(shop.update_at).format('DD/MM/YYYY HH:mm')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Ngày xóa:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                {shop.delete_at ? moment(shop.delete_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Thông tin User */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Người dùng
            </Typography>
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg mb-6">
                <CardContent>
                    <Box className="flex items-center justify-between">
                        <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                            Tên người dùng: <span className="font-normal">{shop.user.user_name}</span>
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => handleViewUser(shop.user.id_user)}
                            className="!bg-button !text-white"
                        >
                            Xem chi tiết
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Thông tin Vị trí - Dùng Grid để trực quan hơn */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Vị trí
            </Typography>
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg mb-6">
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                ID Vị trí:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">{shop.location.location_id}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                Tên vị trí:
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">{shop.location.location_name}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Thông tin Shop Addresses */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Địa chỉ cửa hàng
            </Typography>
            {Array.isArray(shop.shop_addresses) && shop.shop_addresses.length > 0 ? (
                shop.shop_addresses.map((address) => (
                    <Card key={address.address_id} className="!bg-white dark:!bg-dark-sidebar shadow-lg mb-4">
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                        Địa chỉ:
                                    </Typography>
                                    <Typography className="!text-gray-600 dark:!text-gray-300">{address.address}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography className="!text-gray-700 dark:!text-dark-text !font-semibold">
                                        Số điện thoại:
                                    </Typography>
                                    <Typography className="!text-gray-600 dark:!text-gray-300">{address.phone}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography className="dark:!text-gray-300 mb-6">Không có địa chỉ nào</Typography>
            )}

            {/* Danh sách sản phẩm */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Sản phẩm
            </Typography>
            <Box className="relative mb-6">
                <Box className="flex items-center justify-center">
                    <IconButton
                        onClick={handlePrevProducts}
                        disabled={productIndex === 0}
                        className="!text-gray-500"
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                    <Box className="flex justify-center gap-4 flex-1">
                        {Array.isArray(visibleProducts) && visibleProducts.length > 0 ? (
                            visibleProducts.map((product) => {
                                const thumbnail = product.product_images.find(img => img.is_thumbnail)?.image_url;
                                return (
                                    <Card
                                        key={product.product_id}
                                        className="w-64 h-100 bg-white dark:bg-dark-sidebar shadow-md hover:shadow-lg transition-shadow flex-shrink-0 justify-center"
                                    >
                                        <CardContent className="px-4 py-2 flex flex-col justify-between h-full">
                                            <Image
                                                src={thumbnail || '/placeholder.jpg'}
                                                alt={product.product_name}
                                                width={200}
                                                height={150}
                                                className="w-full max-h-32 object-contain mb-2"
                                            />
                                            <Box className="flex flex-col items-center text-center">
                                                <Typography
                                                    variant="subtitle1"
                                                    className="!text-gray-700 max-w-[225px] dark:!text-dark-text truncate"
                                                    title={product.product_name}
                                                >
                                                    {product.product_name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    className="dark:!text-gray-300 max-w-[225px] truncate"
                                                    title={product.brand || 'N/A'}
                                                >
                                                    {product.brand || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" className="dark:!text-gray-300">
                                                    <StatusChip status={product.status} />
                                                </Typography>
                                                <IconButton
                                                    aria-label="view product"
                                                    onClick={() => handleViewProduct(product.product_id)}
                                                    className="!text-blue-500 hover:!bg-custom-blue dark:hover:!bg-dark-selected"
                                                >
                                                    <ViewListIcon />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Typography className="dark:!text-gray-300">Không có sản phẩm nào</Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={handleNextProducts}
                        disabled={productIndex === maxProductIndex}
                        className="!text-gray-500"
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Danh sách Voucher */}
            <Typography variant="h6" className="mb-2 !text-gray-700 dark:!text-dark-text !font-semibold">
                Voucher
            </Typography>
            <Box className="relative mb-6">
                <Box className="flex items-center justify-center">
                    <IconButton
                        onClick={handlePrevVouchers}
                        disabled={voucherIndex === 0}
                        className="!text-gray-500"
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                    <Box className="flex justify-center gap-4 flex-1">
                        {Array.isArray(visibleVouchers) && visibleVouchers.length > 0 ? (
                            visibleVouchers.map((voucher) => (
                                <Card
                                    key={voucher.id}
                                    className="w-64 h-48 bg-white dark:bg-dark-sidebar shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
                                >
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <Typography
                                            variant="subtitle1"
                                            className="!text-gray-700 dark:!text-dark-text truncate"
                                            title={voucher.code}
                                        >
                                            Mã: {voucher.code}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className="dark:!text-gray-300 truncate"
                                            title={`${voucher.discount_percent}%`}
                                        >
                                            Giảm: {voucher.discount_percent}%
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className="dark:!text-gray-300 truncate"
                                            title={moment(voucher.valid_from).format('DD/MM/YYYY')}
                                        >
                                            Từ: {moment(voucher.valid_from).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className="dark:!text-gray-300 truncate"
                                            title={moment(voucher.valid_to).format('DD/MM/YYYY')}
                                        >
                                            Đến: {moment(voucher.valid_to).format('DD/MM/YYYY')}
                                        </Typography>
                                        <IconButton
                                            aria-label="detail"
                                            title="Xem chi tiết Voucher"
                                            onClick={() => handleViewVoucher(voucher.id)}
                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                            size="small"
                                        >
                                            <EditNoteIcon className="!w-7 !h-6" />
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography className="dark:!text-gray-300">Không có voucher nào</Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={handleNextVouchers}
                        disabled={voucherIndex === maxVoucherIndex}
                        className="!text-gray-500"
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>
        </div>
    );
};

export default ShopDetailPage;