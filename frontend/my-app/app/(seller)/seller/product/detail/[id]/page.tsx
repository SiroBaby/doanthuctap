/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {useQuery} from '@apollo/client';
import {GET_PRODUCT_BY_ID} from '@/graphql/queries';
import {useParams, useRouter} from 'next/navigation';
import {useState} from 'react';
import Image from 'next/image';

// MUI Components
import {
    Container,
    Grid,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Chip,
    CircularProgress,
    Box,
    Divider,
    Button,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from '@mui/icons-material/Edit';

const ProductDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string);

    // State cho ảnh chính
    const [mainImage, setMainImage] = useState<string | null>(null);

    // GraphQL Query
    const {data, loading, error} = useQuery(GET_PRODUCT_BY_ID, {
        variables: {id: productId},
        onCompleted: (data) => {
            const thumbnail = data?.product?.product_images?.find((img: any) => img.is_thumbnail);
            setMainImage(thumbnail?.image_url || data?.product?.product_images?.[0]?.image_url);
        },
    });

    const handleEditProduct = () => {
        router.push(`/seller/product/edit/${productId}`);
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-dark-body">
                <CircularProgress/>
            </Box>
        );
    }

    if (error || !data?.product) {
        return (
            <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-body">
                <ErrorOutlineIcon color="error" sx={{fontSize: 60}}/>
                <Typography variant="h6" className="mt-4 text-gray-700 dark:text-dark-text">
                    {error ? `Lỗi: ${error.message}` : 'Không tìm thấy sản phẩm'}
                </Typography>
            </Box>
        );
    }

    const product = data.product;

    // Hàm tính giá sau khi giảm
    const calculateDiscountedPrice = (basePrice: number, percentDiscount: number) => {
        return basePrice - (basePrice * percentDiscount);
    };

    return (
        <Container maxWidth="lg" className="py-8 bg-gray-100 dark:bg-dark-body min-h-screen">
            <Box className="flex justify-between items-center mb-6">
                <Typography variant="h4" className="font-bold text-gray-800 dark:text-dark-text">
                    Chi tiết sản phẩm
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEditProduct}
                >
                    Chỉnh sửa sản phẩm
                </Button>
            </Box>
            
            <Grid container spacing={4}>
                {/* Phần hình ảnh */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg bg-white dark:bg-dark-sidebar">
                        {/* Ảnh chính */}
                        <Box className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
                            <CardMedia
                                component="img"
                                className="max-w-full max-h-full object-contain"
                                image={mainImage || '/placeholder-image.jpg'}
                                alt={product.product_name}
                            />
                        </Box>
                        {/* Thumbnail images */}
                        <Box className="flex gap-2 p-4 overflow-x-auto bg-white dark:bg-dark-sidebar">
                            {product.product_images?.map((image: any) => (
                                <Image
                                    key={image.image_id}
                                    src={image.image_url}
                                    alt={`${product.product_name} thumbnail`}
                                    width={80}
                                    height={80}
                                    className={`w-20 h-20 object-cover cursor-pointer rounded-md border-2 transition-opacity ${
                                        mainImage === image.image_url
                                            ? 'border-blue-500 opacity-100'
                                            : 'border-gray-200 dark:border-dark-outline opacity-50 hover:opacity-75'
                                    }`}
                                    onClick={() => setMainImage(image.image_url)}
                                />
                            ))}
                        </Box>
                    </Card>
                </Grid>

                {/* Thông tin sản phẩm */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg bg-white dark:bg-dark-sidebar p-4">
                        <CardContent>
                            <Typography variant="h4" className="font-bold mb-2 text-gray-800 dark:text-dark-text">
                                {product.product_name}
                            </Typography>
                            <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300 mb-2">
                                Thương hiệu: {product.brand}
                            </Typography>
                            <Chip
                                label={product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                color={product.status === 'active' ? 'success' : 'error'}
                                className="mb-4"
                            />

                            <Divider className="my-4 border-gray-200 dark:border-dark-outline"/>

                            {/* Thông tin cửa hàng */}
                            <Typography variant="h6" className="font-semibold text-gray-800 dark:text-dark-text">
                                Thông tin cửa hàng
                            </Typography>
                            <Typography className="mt-2 text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Tên cửa hàng:</span> {product.shop.shop_name}
                            </Typography>
                            <Typography className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Liên kết:</span>{' '}
                                <a href={product.shop.link} target="_blank"
                                   className="text-blue-500 dark:text-custom-blue">
                                    {product.shop.link}
                                </a>
                            </Typography>
                            <Typography className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Trạng thái cửa hàng:</span>{' '}
                                {product.shop.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </Typography>

                            <Divider className="my-4 border-gray-200 dark:border-dark-outline"/>

                            {/* Biến thể sản phẩm */}
                            <Typography variant="h6" className="font-semibold mb-2 text-gray-800 dark:text-dark-text">
                                Biến thể sản phẩm
                            </Typography>
                            {product.product_variations?.map((variation: any) => {
                                const discountedPrice = calculateDiscountedPrice(
                                    variation.base_price,
                                    variation.percent_discount
                                );
                                return (
                                    <Box
                                        key={variation.product_variation_id}
                                        className="mb-3 p-3 bg-gray-100 dark:bg-dark-selected rounded"
                                    >
                                        <Typography className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Tên biến thể:</span>{' '}
                                            {variation.product_variation_name}
                                        </Typography>
                                        <Typography className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Giá gốc:</span>{' '}
                                            {variation.base_price.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                        {variation.percent_discount > 0 && (
                                            <Typography className="text-gray-700 dark:text-gray-300">
                                                <span className="font-medium">Giảm giá:</span>{' '}
                                                <span className="text-red-500 dark:text-custom-red">
                                                    {variation.percent_discount * 100}%
                                                </span>
                                            </Typography>
                                        )}
                                        <Typography className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Giá sau giảm:</span>{' '}
                                            {discountedPrice.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                        <Typography className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Số lượng tồn:</span>{' '}
                                            {variation.stock_quantity}
                                        </Typography>
                                        <Typography className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Trạng thái:</span>{' '}
                                            <Chip
                                                label={variation.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                color={variation.status === 'active' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Typography>
                                    </Box>
                                );
                            })}

                            {/* Mô tả */}
                            <Divider className="my-4 border-gray-200 dark:border-dark-outline"/>
                            <Typography variant="h6" className="font-semibold text-gray-800 dark:text-dark-text">
                                Mô tả sản phẩm
                            </Typography>
                            <Typography className="mt-2 text-gray-700 dark:text-gray-300">
                                {product.product_detail?.description}
                            </Typography>

                            {/* Thông tin khác */}
                            <Divider className="my-4 border-gray-200 dark:border-dark-outline"/>
                            <Typography className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Danh mục:</span>{' '}
                                {product.category.category_name}
                            </Typography>
                            <Typography className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Ngày tạo:</span>{' '}
                                {new Date(product.create_at).toLocaleDateString('vi-VN')}
                            </Typography>
                            <Typography className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Ngày cập nhật:</span>{' '}
                                {new Date(product.update_at).toLocaleDateString('vi-VN')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetailPage;