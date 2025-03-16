'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SHOP_ID_BY_USER_ID, GET_SHOP_BY_ID, GET_LOCATIONS } from '@/graphql/queries';
import { UPDATE_SHOP, CREATE_SHOP_ADDRESS, UPDATE_SHOP_ADDRESS, REMOVE_SHOP_ADDRESS, SET_DEFAULT_SHOP_ADDRESS } from '@/graphql/mutations';
import { useAuth } from '@clerk/nextjs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';

interface Location {
  location_id: string;
  location_name: string;
}

interface ShopAddress {
  address_id: number;
  address: string;
  phone: string;
  shop_id: string;
  is_default?: boolean;
}

interface Shop {
  shop_id: string;
  shop_name: string;
  link: string;
  status: string;
  location_id: string;
  id_user: string;
  create_at: string;
  update_at: string;
  delete_at: string;
  shop_addresses: ShopAddress[];
  user: {
    id_user: string;
    user_name: string;
  };
  location: {
    location_id: string;
    location_name: string;
  };
}

const ShopManagementPage = () => {
  const { userId } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    shop_name: '',
    link: '',
    status: '',
    location_id: '',
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Dialog states for shop address management
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    address_id: 0,
    address: '',
    phone: '',
    shop_id: '',
    is_default: false,
  });
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Get shop ID by user ID
  const { loading: shopIdLoading } = useQuery(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.getShopIdByUserId?.shop_id) {
        setShopId(data.getShopIdByUserId.shop_id);
      }
    },
  });

  // Get shop data by shop ID
  const { loading: shopDataLoading, refetch: refetchShopData } = useQuery(GET_SHOP_BY_ID, {
    variables: { id: shopId },
    skip: !shopId,
    onCompleted: (data) => {
      if (data?.shop) {
        setShopData(data.shop);
        setFormData({
          shop_name: data.shop.shop_name || '',
          link: data.shop.link || '',
          status: data.shop.status || 'active',
          location_id: data.shop.location_id || '',
        });
        
        // Kiểm tra nếu chỉ có 1 địa chỉ và chưa có địa chỉ mặc định, tự động đặt làm mặc định
        if (data.shop.shop_addresses.length === 1 && !data.shop.shop_addresses.some((addr: ShopAddress) => addr.is_default)) {
          handleSetDefaultAddress(data.shop.shop_addresses[0].address_id);
        }
        
        // Kiểm tra nếu không có địa chỉ mặc định nào, hiển thị cảnh báo
        if (data.shop.shop_addresses.length > 0 && !data.shop.shop_addresses.some((addr: ShopAddress) => addr.is_default)) {
          setSnackbar({
            open: true,
            message: 'Bạn chưa có địa chỉ mặc định. Vui lòng chọn một địa chỉ làm mặc định.',
            severity: 'warning',
          });
        }
      }
    },
  });

  // Get locations
  const { data: locationsData } = useQuery(GET_LOCATIONS);

  // Update shop mutation
  const [updateShop, { loading: updateShopLoading }] = useMutation(UPDATE_SHOP, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin shop thành công!',
        severity: 'success',
      });
      setEditMode(false);
      refetchShopData();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi cập nhật shop: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Shop address mutations
  const [createShopAddress, { loading: createAddressLoading }] = useMutation(CREATE_SHOP_ADDRESS, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Thêm địa chỉ shop thành công!',
        severity: 'success',
      });
      handleCloseAddressDialog();
      window.location.reload();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi thêm địa chỉ: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [updateShopAddress, { loading: updateAddressLoading }] = useMutation(UPDATE_SHOP_ADDRESS, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Cập nhật địa chỉ shop thành công!',
        severity: 'success',
      });
      handleCloseAddressDialog();
      window.location.reload();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi cập nhật địa chỉ: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [removeShopAddress, { loading: removeAddressLoading }] = useMutation(REMOVE_SHOP_ADDRESS, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Xóa địa chỉ shop thành công!',
        severity: 'success',
      });
      handleCloseDeleteDialog();
      window.location.reload();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi xóa địa chỉ: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [setDefaultAddress, { loading: setDefaultLoading }] = useMutation(SET_DEFAULT_SHOP_ADDRESS, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Đã đặt địa chỉ mặc định thành công!',
        severity: 'success',
      });
      window.location.reload();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi đặt địa chỉ mặc định: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    setAddressFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFormData((prev) => ({
      ...prev,
      is_default: e.target.checked,
    }));
  };

  const handleSubmit = () => {
    updateShop({
      variables: {
        updateShopInput: {
          id: shopId,
          ...formData,
        },
      },
    });
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (shopData) {
      setFormData({
        shop_name: shopData.shop_name || '',
        link: shopData.link || '',
        status: shopData.status || 'active',
        location_id: shopData.location_id || '',
      });
    }
    setEditMode(false);
  };

  // Address dialog handlers
  const handleOpenAddressDialog = (address?: ShopAddress) => {
    if (address) {
      setAddressFormData({
        address_id: address.address_id,
        address: address.address,
        phone: address.phone,
        shop_id: address.shop_id,
        is_default: address.is_default || false,
      });
      setIsNewAddress(false);
    } else {
      setAddressFormData({
        address_id: 0,
        address: '',
        phone: '',
        shop_id: shopId || '',
        is_default: shopData?.shop_addresses.length === 0 ? true : false, // Nếu không có địa chỉ nào, đặt mặc định = true
      });
      setIsNewAddress(true);
    }
    setAddressDialogOpen(true);
  };

  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
    setAddressFormData({
      address_id: 0,
      address: '',
      phone: '',
      shop_id: '',
      is_default: false,
    });
  };

  const handleSaveAddress = () => {
    if (isNewAddress) {
      createShopAddress({
        variables: {
          createShopAddressInput: {
            address: addressFormData.address,
            phone: addressFormData.phone,
            shop_id: shopId,
            is_default: addressFormData.is_default,
          },
        },
      });
    } else {
      updateShopAddress({
        variables: {
          updateShopAddressInput: {
            address_id: addressFormData.address_id,
            address: addressFormData.address,
            phone: addressFormData.phone,
            shop_id: shopId,
            is_default: addressFormData.is_default,
          },
        },
      });
    }
  };

  // Delete address dialog handlers
  const handleOpenDeleteDialog = (addressId: number) => {
    // Kiểm tra xem địa chỉ này có phải là mặc định không
    const address = shopData?.shop_addresses.find(addr => addr.address_id === addressId);
    if (address?.is_default) {
      setSnackbar({
        open: true,
        message: 'Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ mặc định khác trước khi xóa.',
        severity: 'error',
      });
      return;
    }
    
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  const handleDeleteAddress = () => {
    if (addressToDelete) {
      removeShopAddress({
        variables: { id: addressToDelete },
      });
    }
  };

  // Hàm xử lý đặt địa chỉ mặc định
  const handleSetDefaultAddress = (addressId: number) => {
    setDefaultAddress({
      variables: { id: addressId },
    });
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Loading state
  if (shopIdLoading || shopDataLoading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
        <Typography className="ml-3">Đang tải thông tin cửa hàng...</Typography>
      </Box>
    );
  }

  // No shop found for this user
  if (!shopId) {
    return (
      <Box className="p-6">
        <Alert severity="info">
          Bạn chưa có cửa hàng. Vui lòng liên hệ với quản trị viên để được hỗ trợ tạo cửa hàng.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-6 font-bold">
        Quản lý thông tin cửa hàng
      </Typography>

      <Grid container spacing={4}>
        {/* Shop Information Card */}
        <Grid item xs={12}>
          <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-bold">
                  Thông tin cửa hàng
                </Typography>
                {!editMode ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      className="mr-2"
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit}
                      disabled={updateShopLoading}
                    >
                      {updateShopLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên cửa hàng"
                    value={formData.shop_name}
                    name="shop_name"
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mb-4"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Link cửa hàng"
                    value={formData.link}
                    name="link"
                    onChange={handleChange}
                    disabled={!editMode}
                    className="mb-4"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formData.status}
                      name="status"
                      label="Trạng thái"
                      onChange={handleChange}
                    >
                      <MenuItem value="active">Hoạt động</MenuItem>
                      <MenuItem value="inactive">Tạm ngừng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Khu vực</InputLabel>
                    <Select
                      value={formData.location_id}
                      name="location_id"
                      label="Khu vực"
                      onChange={handleChange}
                    >
                      {locationsData?.locations.map((location: Location) => (
                        <MenuItem key={location.location_id} value={location.location_id}>
                          {location.location_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box className="mt-4">
                <Typography variant="subtitle1" className="font-semibold">
                  Thông tin chủ shop
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên người dùng"
                      value={shopData?.user?.user_name || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="User ID"
                      value={shopData?.user?.id_user || ''}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shop Addresses Card */}
        <Grid item xs={12}>
          <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-bold">
                  Địa chỉ cửa hàng
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddressDialog()}
                >
                  Thêm địa chỉ
                </Button>
              </Box>

              {shopData?.shop_addresses && shopData.shop_addresses.length > 0 ? (
                <TableContainer component={Paper} className="mb-4">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell>Mặc định</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shopData.shop_addresses.map((address) => (
                        <TableRow 
                          key={address.address_id}
                          sx={{ backgroundColor: address.is_default ? 'rgba(46, 125, 50, 0.08)' : 'inherit' }}
                        >
                          <TableCell>{address.address_id}</TableCell>
                          <TableCell>{address.address}</TableCell>
                          <TableCell>{address.phone}</TableCell>
                          <TableCell>
                            {address.is_default ? (
                              <Chip 
                                color="success" 
                                icon={<HomeIcon />}
                                label="Mặc định" 
                              />
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                onClick={() => handleSetDefaultAddress(address.address_id)}
                                disabled={setDefaultLoading}
                              >
                                Đặt mặc định
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenAddressDialog(address)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(address.address_id)}
                              disabled={address.is_default}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" className="mb-4">
                  Cửa hàng chưa có địa chỉ nào. Hãy thêm địa chỉ để khách hàng có thể liên lạc.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={handleCloseAddressDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isNewAddress ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
        </DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <TextField
              fullWidth
              label="Địa chỉ"
              name="address"
              value={addressFormData.address}
              onChange={handleAddressChange}
              className="mb-4"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={addressFormData.phone}
              onChange={handleAddressChange}
              className="mb-4"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={addressFormData.is_default}
                  onChange={handleCheckboxChange}
                  name="is_default"
                />
              }
              label="Đặt làm địa chỉ mặc định"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddressDialog}>Hủy</Button>
          <Button
            onClick={handleSaveAddress}
            variant="contained"
            disabled={createAddressLoading || updateAddressLoading}
          >
            {createAddressLoading || updateAddressLoading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa địa chỉ</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleDeleteAddress}
            color="error"
            variant="contained"
            disabled={removeAddressLoading}
          >
            {removeAddressLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShopManagementPage; 