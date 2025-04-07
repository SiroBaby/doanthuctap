'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popper,
  Paper,
  ClickAwayListener,
  InputAdornment,
} from '@mui/material';
import { useMutation, useQuery, ApolloError } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { CREATE_SHOP, CREATE_SHOP_ADDRESS, UPDATE_USER_ROLE } from '@/graphql/mutations';
import { GET_LOCATIONS } from '@/graphql/queries';
import axios from 'axios';

interface AddressSuggestion {
  description: string;
  place_id: string;
}

interface GoongPrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  }
}

interface GoongResponse {
  predictions: GoongPrediction[];
  status: string;
  execution_time?: string;
}

interface Location {
  location_id: string;
  location_name: string;
}

export default function CreateShopPage() {
  const router = useRouter();
  const { userId, isSignedIn, isLoaded } = useAuth();
  
  // Form data
  const [shopName, setShopName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [status, setStatus] = useState('active');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [shopAddress, setShopAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Goong Map Address
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Alert state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Loading state
  const [creating, setCreating] = useState(false);

  // GraphQL queries and mutations
  const { data: locationsData } = useQuery(GET_LOCATIONS);
  
  const [createShop] = useMutation(CREATE_SHOP);
  const [createShopAddress] = useMutation(CREATE_SHOP_ADDRESS);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);

  // Check if user is logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Generate shop ID
  const generateShopId = () => {
    if (!userId) return '';
    return `shop_${userId}`;
  };

  // Handle logo upload
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // Goong Map API integration
  const fetchAddressSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/place/autocomplete?api_key=${process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY}&input=${encodeURIComponent(query)}`
      );
      const data: GoongResponse = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions.map((prediction: GoongPrediction) => ({
          description: prediction.description,
          place_id: prediction.place_id
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce cho input địa chỉ
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (addressQuery.trim()) {
      timeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(addressQuery);
      }, 1000); // Debounce 1 giây
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [addressQuery]);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAddressQuery(value);
    setAnchorEl(e.currentTarget);
    setShopAddress(value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setShopAddress(suggestion.description);
    setAddressQuery(suggestion.description);
    setSuggestions([]);
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setSuggestions([]);
    setAnchorEl(null);
  };

  // Form validation
  const validateForm = () => {
    if (!shopName.trim()) {
      setSnackbarMessage('Vui lòng nhập tên cửa hàng');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!locationId) {
      setSnackbarMessage('Vui lòng chọn vị trí');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!logo) {
      setSnackbarMessage('Vui lòng chọn logo cho cửa hàng');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!shopAddress.trim()) {
      setSnackbarMessage('Vui lòng nhập địa chỉ cửa hàng');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!phone.trim()) {
      setSnackbarMessage('Vui lòng nhập số điện thoại');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId) return;
    
    setCreating(true);
    
    try {
      // 1. Upload logo to Cloudinary
      let logoUrl = '';
      if (logo) {
        const formData = new FormData();
        formData.append('images', logo);
        const uploadResponse = await axios.post('https://www.vaashop.io.vn/api/upload', formData);
        logoUrl = uploadResponse.data.imageUrls[0];
        console.log("Đã upload logo thành công:", logoUrl);
      }
      
      // 2. Create Shop
      // Lưu thông tin shop để sử dụng sau khi backend được cập nhật
      const shopId = generateShopId();
      const shopData = {
        shop_id: shopId,
        shop_name: shopName,
        logo: logoUrl,
        status: status,
        location_id: locationId,
        id_user: userId,
        create_at: new Date().toISOString()
      };
      console.log("Thông tin shop sẽ được tạo:", shopData);
      
      try {
        await createShop({
          variables: {
            createShopInput: shopData
          }
        });
        console.log("Gọi API createShop thành công");
      } catch (error) {
        console.error("Lỗi khi tạo shop:", error);
        // Không dừng quy trình để test các chức năng khác
      }
      
      // 3. Create Shop Address
      try {
        await createShopAddress({
          variables: {
            createShopAddressInput: {
              shop_id: shopId,
              address: shopAddress,
              phone: phone,
              is_default: true
            }
          }
        });
        console.log("Gọi API createShopAddress thành công");
      } catch (error) {
        console.error("Lỗi khi tạo địa chỉ shop:", error);
        // Không dừng quy trình để test các chức năng khác
      }
      
      // 4. Cập nhật role của user thành seller
      try {
        await updateUserRole({
          variables: {
            userId: userId,
            role: 'seller'
          }
        });
        console.log("Gọi API updateUserRole thành công");
      } catch (error: unknown) {
        console.error("Lỗi khi cập nhật role user:", error);
        if (error instanceof ApolloError) {
          const graphqlError = error.graphQLErrors?.[0];
          setSnackbarMessage(`Lỗi khi cập nhật role: ${graphqlError?.message || error.message || 'Không xác định'}`);
        } else {
          setSnackbarMessage(`Lỗi khi cập nhật role: ${error instanceof Error ? error.message : 'Không xác định'}`);
        }
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
      
      setSnackbarMessage('Tạo kênh người bán thành công!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
      
    } catch (error: unknown) {
      setSnackbarMessage(`Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error creating shop:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Suggestions popup state
  const open = Boolean(anchorEl) && suggestions.length > 0;
  const id = open ? 'address-suggestions' : undefined;

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        Tạo kênh người bán
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">Thông tin cửa hàng</Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Tên cửa hàng"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              placeholder="Nhập tên cửa hàng của bạn"
            />
            
            <FormControl fullWidth required>
              <InputLabel id="location-label">Vị trí</InputLabel>
              <Select
                labelId="location-label"
                value={locationId}
                label="Vị trí"
                onChange={(e) => setLocationId(e.target.value)}
              >
                {locationsData?.locations?.map((location: Location) => (
                  <MenuItem key={location.location_id} value={location.location_id}>
                    {location.location_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Trạng thái"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Tạm ngừng</MenuItem>
              </Select>
            </FormControl>
            
            <Box className="flex flex-col items-center space-y-2">
              <Typography variant="body1">Logo cửa hàng</Typography>
              <Box 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-48 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={handleClickUpload}
              >
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image 
                      src={logoPreview} 
                      alt="Logo preview" 
                      fill
                      sizes="128px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <Typography variant="body2" className="text-gray-500 text-center">
                    Click để chọn ảnh logo
                  </Typography>
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleLogoChange}
              />
            </Box>
            
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <TextField
                  fullWidth
                  label="Địa chỉ cửa hàng"
                  value={addressQuery}
                  onChange={handleAddressInputChange}
                  required
                  inputRef={addressInputRef}
                  placeholder="Nhập địa chỉ để tìm kiếm"
                  InputProps={{
                    endAdornment: loading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <Popper 
                  id={id} 
                  open={open} 
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
                >
                  <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List>
                      {suggestions.map((suggestion) => (
                        <ListItem key={suggestion.place_id} disablePadding>
                          <ListItemButton onClick={() => handleSuggestionClick(suggestion)}>
                            <ListItemText primary={suggestion.description} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>
            
            <TextField
              fullWidth
              label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              placeholder="Nhập số điện thoại cửa hàng"
            />
            
            <Box className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outlined"
                onClick={() => router.push('/customer')}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <CircularProgress size={20} color="inherit" className="mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo kênh người bán'
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 