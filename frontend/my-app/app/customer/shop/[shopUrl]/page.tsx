'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Divider, 
  Button, 
  TextField, 
  Pagination, 
  Rating, 
  CircularProgress, 
  Avatar, 
  Stack
} from '@mui/material';
import toast from 'react-hot-toast';
import { GET_SHOP_BY_ID, GET_PRODUCTS_BY_SHOP_ID, GET_PRODUCT_REVIEWS } from '@/graphql/queries';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import { gql, useMutation } from '@apollo/client';
import ProductCard from '@/app/components/layout/ProductCard';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StoreIcon from '@mui/icons-material/Store';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';
import vi from 'date-fns/locale/vi';

interface ShopAddress {
  address_id: number;
  address: string;
  phone: string;
  is_default: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  brand: string;
  status: string;
  product_images: {
    image_url: string;
    is_thumbnail: boolean;
  }[];
  product_variations: {
    base_price: number;
    percent_discount: number;
  }[];
}

interface ProductsData {
  getProductsByShopId: {
    totalCount: number;
    totalPage: number;
    data: Product[];
  };
}

interface Review {
  rating: number;
}

interface CreateChatResponse {
  createChat: {
    chat_id: string;
  };
}

interface CreateChatVariables {
  createChatInput: {
    id_user: string;
    shop_id: string;
  };
}

const CREATE_CHAT = gql`
  mutation CreateChat($createChatInput: CreateChatDto!) {
    createChat(createChatInput: $createChatInput) {
      chat_id
    }
  }
`;

export default function ShopDetailPage() {
  const { shopUrl } = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { isConnected } = useSocket();
  const { handleChatCreated, setIsOpen } = useChat();
  const client = useApolloClient();
  
  // State for shop ratings
  const [shopRating, setShopRating] = useState({ averageRating: 0, totalReviews: 0 });
  
  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Queries
  const { data: shopData, loading: shopLoading } = useQuery(GET_SHOP_BY_ID, {
    variables: { id: shopUrl },
    skip: !shopUrl,
  });

  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery<ProductsData>(
    GET_PRODUCTS_BY_SHOP_ID,
    {
      variables: {
        id: shopData?.shop?.shop_id,
        page,
        limit: 12,
        search: searchTerm,
      },
      skip: !shopData?.shop?.shop_id,
    }
  );
  
  // Manually calculate shop rating from products (fallback method)
  const calculateShopRating = useCallback(async () => {
    if (!productsData?.getProductsByShopId?.data?.length) return;
    
    let totalRating = 0;
    let totalReviews = 0;
    
    try {
      // Get ratings for each product
      for (const product of productsData.getProductsByShopId.data) {
        try {
          const { data } = await client.query({
            query: GET_PRODUCT_REVIEWS,
            variables: { productId: product.product_id }
          });
          
          console.log(`Reviews for product ${product.product_id}:`, data?.getProductReviews?.data);
          
          if (data?.getProductReviews?.data?.length) {
            const reviews = data.getProductReviews.data;
            reviews.forEach((review: Review) => {
              totalRating += review.rating;
              totalReviews++;
            });
          }
        } catch (err) {
          console.error(`Error fetching reviews for product ${product.product_id}:`, err);
        }
      }
      
      console.log(`Total ratings calculated: ${totalRating} from ${totalReviews} reviews`);
      
      // Update state with calculated values
      if (totalReviews > 0) {
        setShopRating({
          averageRating: totalRating / totalReviews,
          totalReviews
        });
      }
    } catch (error) {
      console.error("Error calculating shop rating:", error);
    }
  }, [productsData, client]);
  
  // Manually calculate shop rating from products
  useEffect(() => {
    if (shopData?.shop?.shop_id && productsData?.getProductsByShopId?.data) {
      calculateShopRating();
    }
  }, [shopData?.shop?.shop_id, productsData, calculateShopRating]);

  // Chat mutation
  const [createChat] = useMutation<CreateChatResponse, CreateChatVariables>(CREATE_CHAT, {
    onCompleted: (data) => {
      setIsLoading(false);
      console.log('Chat created successfully, opening chat...');
      sessionStorage.setItem('openChatFromButton', 'true');
      setIsOpen(true);
      handleChatCreated(data.createChat.chat_id);
    },
    onError: (error) => {
      setIsLoading(false);
      let errorMessage = "Could not connect to chat. Please try again.";
      
      if (error.message.includes("Cannot create chat with your own shop")) {
        errorMessage = "You cannot chat with your own shop.";
      }
      
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-center',
      });
    },
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    refetchProducts({
      id: shopData?.shop?.shop_id,
      page: 1,
      limit: 12,
      search: searchTerm,
    });
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chat with shop
  const handleChatClick = async () => {
    if (!isSignedIn || !user) {
      toast.error("Vui lòng đăng nhập để trò chuyện với người bán", {
        duration: 3000,
        position: 'top-center',
      });
      router.push("/sign-in");
      return;
    }
    
    if (!isConnected) {
      toast.error("Dịch vụ chat hiện đang không khả dụng. Vui lòng thử lại sau.", {
        duration: 3000,
        position: 'bottom-center',
      });
      return;
    }

    try {
      setIsLoading(true);
      await createChat({
        variables: {
          createChatInput: {
            id_user: user.id,
            shop_id: shopData?.shop?.shop_id,
          },
        },
      });
    } catch {
      setIsLoading(false);
      toast.error("Kết nối thất bại. Vui lòng thử lại.", {
        duration: 3000,
        position: 'bottom-center',
      });
    }
  };

  // Loading state
  if (shopLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Shop not found
  if (!shopData?.shop) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h4" gutterBottom>
            Không tìm thấy cửa hàng
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Cửa hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => router.push('/customer')}
          >
            Quay lại trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  const shop = shopData.shop;
  const defaultAddress = shop.shop_addresses.find((address: ShopAddress) => address.is_default) || shop.shop_addresses[0];
  
  // Format date
  const formattedDate = shop.create_at ? 
    formatDistanceToNow(new Date(shop.create_at), { addSuffix: true, locale: vi }) : 
    'Không rõ';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Shop Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Logo và thông tin cơ bản */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  src={shop.logo || '/logo/avt-capy.png'} 
                  alt={shop.shop_name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold">
                  {shop.shop_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating 
                    value={shopRating.averageRating} 
                    precision={0.1} 
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({shopRating.totalReviews > 0 ? shopRating.totalReviews : 'Chưa có'} đánh giá)
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Thông tin chi tiết */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StoreIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {defaultAddress?.address || 'Chưa cập nhật địa chỉ'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MailOutlineIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {defaultAddress?.phone || 'Chưa cập nhật số điện thoại'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Tham gia {formattedDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {productsData?.getProductsByShopId?.totalCount || 0} sản phẩm
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Nút hành động */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={handleChatClick}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang kết nối...' : 'Chat với người bán'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Sản phẩm" />
          <Tab label="Đánh giá" />
          <Tab label="Thông tin shop" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {/* Tab 1: Sản phẩm */}
        {activeTab === 0 && (
          <>
            {/* Search bar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <SearchIcon 
                      sx={{ cursor: 'pointer' }} 
                      onClick={handleSearch}
                    />
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
              >
                Lọc
              </Button>
            </Box>

            {/* Products Grid */}
            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : productsData?.getProductsByShopId?.data?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Không tìm thấy sản phẩm nào phù hợp.
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {productsData?.getProductsByShopId?.data.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {(productsData?.getProductsByShopId?.totalPage || 0) > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={productsData?.getProductsByShopId?.totalPage || 1}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Tab 2: Đánh giá */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  {shopRating.averageRating > 0 
                    ? shopRating.averageRating.toFixed(1) 
                    : "0.0"}
                </Typography>
                <Rating 
                  value={shopRating.averageRating} 
                  precision={0.5} 
                  readOnly
                  size="large"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  {shopRating.totalReviews > 0 
                    ? `Dựa trên ${shopRating.totalReviews} đánh giá từ khách hàng` 
                    : "Chưa có đánh giá nào từ khách hàng"}
                </Typography>
                
                <Box sx={{ mt: 3, width: '100%', maxWidth: 500 }}>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    Đánh giá được tính dựa trên đánh giá của khách hàng cho các sản phẩm của shop
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Thông tin shop */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin chi tiết
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Chủ shop
                      </Typography>
                      <Typography variant="body1">
                        {shop.user?.user_name || 'Không có thông tin'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tên cửa hàng
                      </Typography>
                      <Typography variant="body1">
                        {shop.shop_name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Khu vực
                      </Typography>
                      <Typography variant="body1">
                        {shop.location?.location_name || 'Không có thông tin'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian hoạt động
                      </Typography>
                      <Typography variant="body1">
                        Tham gia {formattedDate}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Địa chỉ liên hệ
                      </Typography>
                      <Typography variant="body1">
                        {defaultAddress?.address || 'Chưa cập nhật địa chỉ'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">
                        {defaultAddress?.phone || 'Chưa cập nhật số điện thoại'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
} 