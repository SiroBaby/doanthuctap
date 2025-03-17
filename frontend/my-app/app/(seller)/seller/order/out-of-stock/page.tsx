'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_SHOP_ID_BY_USER_ID, GET_OUT_OF_STOCK_PRODUCTS } from '@/graphql/queries';
import Image from 'next/image';

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Pagination,
  Skeleton,
  Alert,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Link from 'next/link';

interface ShopIdResponse {
  getShopIdByUserId: {
    shop_id: string;
  };
}

interface OutOfStockProductsResponse {
  getOutOfStockProducts: {
    products: Array<{
      product_id: string;
      product_name: string;
      brand: string;
      status: string;
      shop_id: string;
      product_images: Array<{
        image_url: string;
        is_thumbnail: boolean;
      }>;
      category: {
        category_name: string;
      };
    }>;
    variations: Array<{
      product_variation_id: string;
      product_variation_name: string;
      base_price: number;
      percent_discount: number;
      stock_quantity: number;
      status: string;
      product: {
        product_id: string;
        product_name: string;
        brand: string;
        shop_id: string;
        product_images: Array<{
          image_url: string;
          is_thumbnail: boolean;
        }>;
        category: {
          category_name: string;
        };
      };
    }>;
    totalCount: number;
    totalPage: number;
  };
}

const OutOfStockPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  
  const [shopId, setShopId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [tab, setTab] = useState<string>('all');
  
  const LIMIT = 12;
  
  // Fetch shop ID
  const { loading: shopIdLoading } = useQuery<ShopIdResponse>(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.getShopIdByUserId?.shop_id) {
        setShopId(data.getShopIdByUserId.shop_id);
      }
    },
  });
  
  // Fetch out of stock products
  const { loading: productsLoading, error: productsError, data: productsData } = 
    useQuery<OutOfStockProductsResponse>(GET_OUT_OF_STOCK_PRODUCTS, {
    variables: {
      getOutOfStockProductsInput: {
        shop_id: shopId,
        page,
        limit: LIMIT,
      },
    },
    skip: !shopId,
  });
  
  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
  
  // Get thumbnail image
  const getThumbnailImage = (images: Array<{ image_url: string; is_thumbnail: boolean }>) => {
    const thumbnail = images.find(img => img.is_thumbnail);
    return thumbnail ? thumbnail.image_url : images[0]?.image_url || '';
  };
  
  const loading = shopIdLoading || productsLoading;
  const error = productsError;
  const products = productsData?.getOutOfStockProducts.products || [];
  const variations = productsData?.getOutOfStockProducts.variations || [];
  const totalPages = productsData?.getOutOfStockProducts.totalPage || 0;
  
  // Filter items based on selected tab
  const filteredItems = tab === 'products' 
    ? products 
    : tab === 'variations' 
      ? variations 
      : [...products, ...variations];
  
  if (!userId) {
    return (
      <Container className="p-6">
        <Alert severity="warning">
          Vui lòng đăng nhập để xem sản phẩm hết hàng
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-6">
      <Box className="mb-6">
        <Breadcrumbs aria-label="breadcrumb" className="mb-4">
          <Link href="/seller/order" passHref>
            <MuiLink underline="hover" color="inherit">
              Quản lý đơn hàng
            </MuiLink>
          </Link>
          <Typography color="text.primary">Sản phẩm hết hàng</Typography>
        </Breadcrumbs>
        
        <Box className="flex justify-between items-center mb-4">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold">
              Sản phẩm hết hàng
            </Typography>
            <Typography color="textSecondary">
              Danh sách sản phẩm đã hết hàng trong cửa hàng của bạn
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/seller/order')}
          >
            Quay lại
          </Button>
        </Box>
      </Box>
      
      <Paper className="mb-6">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          className="border-b border-gray-200"
        >
          <Tab value="all" label="Tất cả" />
          <Tab value="products" label="Sản phẩm" />
          <Tab value="variations" label="Biến thể" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="text" height={30} className="mt-2" />
              <Skeleton variant="text" height={20} width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error">
          Đã xảy ra lỗi khi tải dữ liệu: {error.message}
        </Alert>
      ) : filteredItems.length === 0 ? (
        <Box className="py-10 text-center">
          <InventoryIcon fontSize="large" color="disabled" className="mb-2" />
          <Typography variant="h6" color="textSecondary">
            Không có sản phẩm hết hàng
          </Typography>
          <Typography color="textSecondary">
            Tất cả sản phẩm của bạn đều còn hàng
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredItems.map((item, index) => {
              // Check if item is a product or variation
              const isProduct = 'product_id' in item;
              const productId = isProduct ? item.product_id : item.product.product_id;
              const productName = isProduct ? item.product_name : item.product.product_name;
              const images = isProduct ? item.product_images : item.product.product_images;
              const category = isProduct ? item.category : item.product.category;
              const thumbnailUrl = getThumbnailImage(images);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card className="h-full flex flex-col">
                    <CardActionArea 
                      component={Link}
                      href={`/seller/product/edit/${productId}`}
                    >
                      <Box className="relative pt-[100%]">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={productName}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <InventoryIcon fontSize="large" />
                          </Box>
                        )}
                        <Box className="absolute top-2 right-2">
                          <Chip
                            icon={<WarningIcon />}
                            label="Hết hàng"
                            color="error"
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <CardContent>
                        <Typography variant="h6" className="line-clamp-2 mb-1">
                          {productName}
                        </Typography>
                        
                        {!isProduct && (
                          <Typography variant="body2" color="textSecondary" className="mb-1">
                            Biến thể: {item.product_variation_name}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="textSecondary" className="mb-2">
                          Danh mục: {category.category_name}
                        </Typography>
                        
                        {!isProduct && (
                          <Box className="flex items-center justify-between">
                            <Typography variant="body1" className="font-medium">
                              {formatCurrency(item.base_price * (1 - item.percent_discount / 100))}
                            </Typography>
                            
                            {item.percent_discount > 0 && (
                              <Typography variant="body2" color="textSecondary" className="line-through">
                                {formatCurrency(item.base_price)}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                    
                    <Box className="mt-auto p-3 pt-0">
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        component={Link}
                        href={`/seller/product/edit/${productId}`}
                      >
                        Cập nhật kho hàng
                      </Button>
                    </Box>
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
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default OutOfStockPage; 