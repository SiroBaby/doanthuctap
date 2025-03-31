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
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { GET_SHOP_BY_ID, GET_PRODUCTS_BY_SHOP_ID, GET_PRODUCT_REVIEWS, GET_USER_VOUCHER_STORAGE } from '@/graphql/queries';
import { SAVE_SHOP_VOUCHER } from '@/graphql/mutations';
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
import Image from 'next/image';

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

interface ShopVoucher {
  id: number;
  code: string;
  discount_percent: number;
  minimum_require_price: number;
  max_discount_price: number;
  valid_from: string;
  valid_to: string;
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

interface VoucherStorage {
  voucher_storage_id: number;
  voucher_id: number;
  voucher_type: string;
  claimed_at: string;
  is_used: boolean;
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

  // State for saved vouchers
  const [savedVouchers, setSavedVouchers] = useState<number[]>([]);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

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
  
  // Query to get user's saved vouchers
  const { data: userVoucherData } = useQuery(GET_USER_VOUCHER_STORAGE, {
    variables: { userId: user?.id },
    skip: !isSignedIn || !user,
  });

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Save voucher mutation
  const [saveVoucher, { loading: savingVoucher }] = useMutation(SAVE_SHOP_VOUCHER, {
    onCompleted: (data) => {
      if (data?.createVoucherStorage) {
        setSavedVouchers(prev => [...prev, data.createVoucherStorage.voucher_id]);
        showSnackbar('Đã lưu mã giảm giá thành công!', 'success');
      }
    },
    onError: (error) => {
      let errorMessage = "Không thể lưu mã giảm giá. Vui lòng thử lại.";
      
      if (error.message.includes("đã lưu mã giảm giá này") || 
          error.message.includes("You have already saved this voucher") ||
          error.message.includes("Bạn đã lưu mã giảm giá này")) {
        errorMessage = "Bạn đã lưu mã giảm giá này rồi.";
      }
      
      showSnackbar(errorMessage, 'error');
    },
  });

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

  // Initialize saved vouchers from user data
  useEffect(() => {
    if (userVoucherData?.getUserVoucherStorage) {
      const savedVoucherIds = userVoucherData.getUserVoucherStorage
        .filter((storage: VoucherStorage) => storage.voucher_type === 'shop_voucher')
        .map((storage: VoucherStorage) => storage.voucher_id);
      setSavedVouchers(savedVoucherIds);
    }
  }, [userVoucherData]);

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
      
      showSnackbar(errorMessage, 'error');
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
      showSnackbar("Vui lòng đăng nhập để trò chuyện với người bán", 'error');
      router.push("/sign-in");
      return;
    }
    
    if (!isConnected) {
      showSnackbar("Dịch vụ chat hiện đang không khả dụng. Vui lòng thử lại sau.", 'error');
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
      showSnackbar("Kết nối thất bại. Vui lòng thử lại.", 'error');
    }
  };

  const handleSaveVoucher = async (voucherId: number) => {
    if (!isSignedIn || !user) {
      showSnackbar("Vui lòng đăng nhập để lưu mã giảm giá", 'error');
      router.push("/sign-in");
      return;
    }

    try {
      // Kiểm tra xem voucher đã được lưu trong state local chưa
      if (savedVouchers.includes(voucherId)) {
        showSnackbar("Bạn đã lưu mã giảm giá này rồi", 'error');
        return;
      }

      // Lưu voucher
      await saveVoucher({
        variables: {
          createVoucherStorageInput: {
            user_id: user.id,
            voucher_id: voucherId,
            voucher_type: 'shop_voucher',
            claimed_at: new Date().toISOString(),
            is_used: false,
          },
        },
      });

      // Không cập nhật state ở đây - việc này sẽ được thực hiện trong onCompleted nếu thành công
    } catch (error: Error | { message: string } | unknown) {
      console.error('Lỗi khi lưu mã giảm giá:', error);
      
      // Chuyển đổi lỗi thành chuỗi để dễ kiểm tra
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'object' && error !== null && 'message' in error 
                          ? String(error.message) : 'Lỗi không xác định';
      
      // Hiển thị thông báo lỗi cụ thể dựa trên loại lỗi
      if (errorMessage.includes("Không tìm thấy mã giảm giá")) {
        showSnackbar("Mã giảm giá không tồn tại hoặc đã hết hạn", 'error');
      } else if (errorMessage.includes("đã lưu mã giảm giá này") || errorMessage.includes("CONFLICT")) {
        showSnackbar("Bạn đã lưu mã giảm giá này rồi", 'error');
      } else {
        showSnackbar("Không thể lưu mã giảm giá. Vui lòng thử lại sau.", 'error');
      }
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
          <Tab label="Mã giảm giá" />
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

        {/* Tab 3: Mã giảm giá */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              {shop.shop_vouchers && shop.shop_vouchers.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {shop.shop_vouchers
                      .filter((voucher: ShopVoucher) => new Date(voucher.valid_to) > new Date())
                      .slice((page - 1) * 5, page * 5)
                      .map((voucher: ShopVoucher) => (
                        <div key={voucher.id} className="relative bg-voucher rounded-lg overflow-hidden">
                          <div className="flex flex-col sm:flex-row items-center p-2 sm:p-4">
                            <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
                              <Image
                                src="/icon/voucher-w.png"
                                alt="Voucher Ticket"
                                width={128}
                                height={96}
                                className="w-16 h-auto sm:w-20 md:w-24 lg:w-32"
                              />
                            </div>

                            <div className="flex-grow text-center sm:text-left mb-2 sm:mb-0">
                              <h3 className="font-bold text-base sm:text-lg">
                                GIẢM {(voucher.discount_percent * 100).toFixed(0)}%
                              </h3>
                              <p className="font-medium text-sm sm:text-base">
                                ĐƠN TỐI THIỂU {new Intl.NumberFormat('vi-VN').format(voucher.minimum_require_price)}đ
                              </p>
                              <p className="text-xs sm:text-sm">
                                Thời hạn đến {new Date(voucher.valid_to).toLocaleDateString('vi-VN')}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              <button 
                                className={`${
                                  savedVouchers.includes(voucher.id)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-button hover:bg-violet-600'
                                } text-white px-6 sm:px-8 md:px-11 py-1 sm:py-2 rounded border-collapse border border-black text-sm sm:text-base`}
                                onClick={() => handleSaveVoucher(voucher.id)}
                                disabled={savedVouchers.includes(voucher.id) || savingVoucher}
                              >
                                {savedVouchers.includes(voucher.id) ? 'ĐÃ LƯU' : 'LƯU'}
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </Box>

                  {/* Pagination */}
                  {Math.ceil(shop.shop_vouchers.filter((voucher: ShopVoucher) => new Date(voucher.valid_to) > new Date()).length / 5) > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={Math.ceil(shop.shop_vouchers.filter((voucher: ShopVoucher) => new Date(voucher.valid_to) > new Date()).length / 5)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Shop chưa có mã giảm giá nào.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Thông tin shop */}
        {activeTab === 3 && (
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 