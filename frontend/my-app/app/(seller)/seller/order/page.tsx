'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from '@apollo/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GET_SHOP_ID_BY_USER_ID, GET_INVOICES_BY_SHOP, GET_DASHBOARD_STATS } from '@/graphql/queries';
import { UPDATE_INVOICE_STATUS } from '@/graphql/mutations';
import { OrderStatus, Invoice, InvoiceProduct } from './types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  Skeleton,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Pending as PendingIcon,
  Done as DoneIcon,
} from '@mui/icons-material';

interface InvoicesResponse {
  getInvoicesByShop: {
    data: Invoice[];
    totalCount: number;
    totalPage: number;
  };
}

interface GetShopIdResponse {
  getShopIdByUserId: {
    shop_id: string;
  };
}

interface StatusCount {
  status: string;
  count: number;
}

interface OrderCounts {
  [key: string]: number;
}

// Add interfaces for the dashboard stats response
interface DashboardStatsResponse {
  getSellerDashboardStats: {
    productStatusCount: StatusCount[];
  };
}

const OrderManagementPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const tabParam = searchParams.get('tab') || 'waiting_for_delivery';
  const pageParam = parseInt(searchParams.get('page') || '1');
  
  const [shopId, setShopId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>(tabParam);
  const [page, setPage] = useState<number>(pageParam);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuInvoiceId, setMenuInvoiceId] = useState<string | null>(null);
  
  // New states for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedMinAmount, setDebouncedMinAmount] = useState(minAmount);
  const [debouncedMaxAmount, setDebouncedMaxAmount] = useState(maxAmount);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const LIMIT = 10;

  // Map tab value to page title and status
  const tabConfig = {
    waiting_for_delivery: {
      title: 'Chờ lấy hàng',
      status: OrderStatus.WAITING_FOR_DELIVERY,
      icon: <PendingIcon />,
      nextAction: {
        label: 'Chuẩn bị hàng',
        status: OrderStatus.PROCESSED,
        icon: <CheckCircleIcon />,
      },
    },
    processed: {
      title: 'Đã xử lý',
      status: OrderStatus.PROCESSED,
      icon: <CheckCircleIcon />,
      nextAction: {
        label: 'Vận chuyển',
        status: OrderStatus.DELIVERY,
        icon: <LocalShippingIcon />,
      },
    },
    delivery: {
      title: 'Đang vận chuyển',
      status: OrderStatus.DELIVERY,
      icon: <LocalShippingIcon />,
      nextAction: {
        label: 'Đã giao',
        status: OrderStatus.DELIVERED,
        icon: <CheckCircleIcon />,
      },
    },
    delivered: {
      title: 'Đã giao',
      status: OrderStatus.DELIVERED,
      icon: <DoneIcon />,
      nextAction: null,
    },
    canceled: {
      title: 'Đã hủy',
      status: OrderStatus.CANCELED,
      icon: <CancelIcon />,
      nextAction: null,
    },
  };

  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    waiting_for_delivery: 0,
    processed: 0,
    delivery: 0,
    delivered: 0,
    canceled: 0
  });

  // Update URL when tab or page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', selectedTab);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [selectedTab, page, pathname, router, searchParams]);

  // Fetch shop ID
  const { loading: shopIdLoading } = useQuery<GetShopIdResponse>(GET_SHOP_ID_BY_USER_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.getShopIdByUserId?.shop_id) {
        setShopId(data.getShopIdByUserId.shop_id);
      }
    },
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait for 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce for min amount
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinAmount(minAmount);
    }, 800);
    return () => clearTimeout(timer);
  }, [minAmount]);

  // Debounce for max amount
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxAmount(maxAmount);
    }, 800);
    return () => clearTimeout(timer);
  }, [maxAmount]);

  // Declare refetchInvoices before using it
  const { loading: invoicesLoading, error: invoicesError, data: invoicesData, refetch: refetchInvoices } = 
    useQuery<InvoicesResponse>(GET_INVOICES_BY_SHOP, {
    variables: {
      getInvoicesByShopInput: {
        shop_id: shopId,
        order_status: selectedTab !== 'out_of_stock' ? tabConfig[selectedTab as keyof typeof tabConfig].status : undefined,
        page,
        limit: LIMIT,
        search: debouncedSearchTerm,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        payment_method: paymentMethod === 'all' ? undefined : paymentMethod,
        min_amount: debouncedMinAmount ? parseFloat(debouncedMinAmount) : undefined,
        max_amount: debouncedMaxAmount ? parseFloat(debouncedMaxAmount) : undefined,
      },
    },
    skip: !shopId || selectedTab === 'out_of_stock',
  });

  // Move useEffects after query declarations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (minAmount !== debouncedMinAmount || maxAmount !== debouncedMaxAmount) {
        setPage(1);
        refetchInvoices();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [minAmount, maxAmount, debouncedMinAmount, debouncedMaxAmount, refetchInvoices, setPage]);

  // Fix the dashboard stats query type
  const { refetch: refetchDashboardStats } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS, {
    variables: { shopId },
    skip: !shopId,
    onCompleted: (data) => {
      if (data?.getSellerDashboardStats?.productStatusCount) {
        const statusCounts = data.getSellerDashboardStats.productStatusCount.reduce<OrderCounts>(
          (acc: OrderCounts, curr: StatusCount) => {
            acc[curr.status.toLowerCase()] = curr.count;
            return acc;
          },
          {} as OrderCounts
        );
        setOrderCounts(statusCounts);
      }
    }
  });

  // Also update dashboard stats when invoice status changes
  const [updateInvoiceStatus, { loading: updatingStatus }] = useMutation(UPDATE_INVOICE_STATUS, {
    onCompleted: async () => {
      await Promise.all([
        refetchInvoices(),
        refetchDashboardStats()
      ]);
      setConfirmDialogOpen(false);
      setSelectedInvoice(null);
      setNextStatus(null);
    },
    onError: (error) => {
      console.error('Error updating invoice status:', error);
      // You might want to show an error message to the user here
    }
  });

  // Update the stats when invoice status changes
  useEffect(() => {
    if (shopId) {
      refetchDashboardStats();
    }
  }, [shopId, refetchDashboardStats, selectedTab]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    setPage(1);
    // Add refetch to update data when switching tabs
    setTimeout(() => {
      refetchInvoices();
    }, 0);
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle action menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoiceId: string) => {
    setActionMenuAnchorEl(event.currentTarget);
    setMenuInvoiceId(invoiceId);
  };

  const handleMenuClose = () => {
    setActionMenuAnchorEl(null);
    setMenuInvoiceId(null);
  };

  // Handle action button click
  const handleActionClick = (invoiceId: string, status: OrderStatus) => {
    setSelectedInvoice(invoiceId);
    setNextStatus(status);
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  // Handle view detail
  const handleViewDetail = (invoiceId: string) => {
    router.push(`/seller/order/detail/${invoiceId}`);
    handleMenuClose();
  };

  // Handle confirm dialog
  const handleConfirm = () => {
    if (selectedInvoice && nextStatus) {
      updateInvoiceStatus({
        variables: {
          updateInvoiceStatusInput: {
            invoice_id: selectedInvoice,
            order_status: nextStatus,
          },
        },
      });
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setSelectedInvoice(null);
    setNextStatus(null);
  };

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter change with debounce
  const handleFilterChange = useCallback(() => {
    setPage(1);
    refetchInvoices();
  }, [refetchInvoices]);

  // Add reset filters function
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPaymentMethod('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchTerm('');
    setPage(1);
    refetchInvoices();
  };

  const handleExport = async () => {
    if (!invoicesData?.getInvoicesByShop.data.length) {
      return;
    }

    const csvData = [
      // Header
      ['Mã đơn hàng', 'Khách hàng', 'Số điện thoại', 'Tổng tiền', 'Số lượng', 'Ngày đặt', 'Trạng thái', 'Phương thức thanh toán'],
      // Data rows
      ...invoicesData.getInvoicesByShop.data.map(invoice => [
        invoice.invoice_id,
        invoice.user?.user_name || '',
        invoice.user?.phone || '',
        invoice.total_amount,
        countTotalProducts(invoice),
        new Date(invoice.create_at).toLocaleString('vi-VN'),
        getStatusLabel(invoice.order_status),
        getPaymentMethodLabel(invoice.payment_method || '')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add helper functions for export
  const getStatusLabel = (status: string) => {
    switch (status) {
      case OrderStatus.WAITING_FOR_DELIVERY:
        return 'Chờ lấy hàng';
      case OrderStatus.PROCESSED:
        return 'Đã xử lý';
      case OrderStatus.DELIVERY:
        return 'Đang vận chuyển';
      case OrderStatus.DELIVERED:
        return 'Đã giao';
      case OrderStatus.CANCELED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod':
        return 'COD';
      case 'bank_transfer':
        return 'Chuyển khoản';
      default:
        return method;
    }
  };

  // Get status chip
  const getStatusChip = (status: string) => {
    switch (status) {
      case OrderStatus.WAITING_FOR_DELIVERY:
        return <Chip color="warning" size="small" label="Chờ lấy hàng" />;
      case OrderStatus.PROCESSED:
        return <Chip color="info" size="small" label="Đã xử lý" />;
      case OrderStatus.DELIVERY:
        return <Chip color="primary" size="small" label="Đang vận chuyển" />;
      case OrderStatus.DELIVERED:
        return <Chip color="success" size="small" label="Đã giao" />;
      case OrderStatus.CANCELED:
        return <Chip color="error" size="small" label="Đã hủy" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count total products
  const countTotalProducts = (invoice: { invoice_products?: Array<InvoiceProduct> }) => {
    return invoice.invoice_products?.reduce((sum, product) => sum + product.quantity, 0) || 0;
  };

  if (shopIdLoading || invoicesLoading) {
    return (
      <Box className="p-4">
        <Skeleton variant="rectangular" height={200} className="mb-4" />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (invoicesError) {
    return (
      <Alert severity="error" className="m-4">
        Có lỗi xảy ra khi tải dữ liệu
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className="py-8 dark:bg-dark-primary min-h-screen">
        {/* Order Statistics */}
        <Grid container spacing={3} className="mb-6 justify-center">
          {Object.entries(tabConfig).map(([key, config]) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={key}>
              <Card 
                className={`
                  transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                  h-[160px] flex flex-col justify-between
                  ${selectedTab === key ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-200'}
                  dark:bg-dark-sidebar dark:border-gray-700 dark:shadow-dark
                `}
              >
                <CardContent className="flex flex-col h-full justify-between p-4">
                  <Typography variant="h6" className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                    <span className={`mr-2 ${selectedTab === key ? 'text-blue-500' : 'text-gray-500'} dark:text-gray-400`}>
                      {config.icon}
                    </span>
                    {config.title}
        </Typography>
                  <Typography 
                    variant="h4" 
                    className={`mt-2 ${selectedTab === key ? 'text-blue-600' : 'text-gray-600'} dark:text-blue-400 font-bold text-center`}
                  >
                    {orderCounts[key] || 0}
        </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filters */}
        <Paper className="mb-6 p-6 shadow-md hover:shadow-lg transition-shadow duration-300 max-w-6xl mx-auto dark:bg-dark-sidebar dark:shadow-dark">
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tìm kiếm đơn hàng"
                value={searchTerm}
                onChange={handleSearch}
                className="shadow-sm"
                InputProps={{
                  className: "dark:text-gray-200",
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-blue-400 dark:text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  className: "dark:text-gray-400"
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'rgb(59 130 246)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(59 130 246)',
                    },
                    '& fieldset': {
                      borderColor: 'rgba(156, 163, 175, 0.3)',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} className="flex justify-end">
              <Stack direction="row" spacing={2}>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`
                    transition-all duration-300 
                    ${showFilters ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}
                  `}
                >
                  Bộ lọc
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={handleExport}
                  disabled={!invoicesData?.getInvoicesByShop.data.length}
                  className="transition-all duration-300 border-green-500 text-green-500 hover:bg-green-50 disabled:opacity-50"
                >
                  Xuất {invoicesData?.getInvoicesByShop.data.length || 0} đơn hàng
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {showFilters && (
            <Grid container spacing={3} className="mt-2">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Từ ngày"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    handleFilterChange();
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      className: "bg-white shadow-sm hover:shadow transition-shadow duration-300",
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'rgb(59 130 246)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(59 130 246)',
                          }
                        }
                      }
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Đến ngày"
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    handleFilterChange();
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      className: "bg-white shadow-sm hover:shadow transition-shadow duration-300",
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'rgb(59 130 246)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(59 130 246)',
                          }
                        }
                      }
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Thanh toán</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      handleFilterChange();
                    }}
                    label="Thanh toán"
                    className="bg-white shadow-sm hover:shadow transition-shadow duration-300"
                    sx={{
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(59 130 246)',
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(59 130 246)',
                        }
                      }
                    }}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="cod">COD</MenuItem>
                    <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Giá từ"
                  type="number"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                  }}
                  className="bg-white shadow-sm hover:shadow transition-shadow duration-300"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'rgb(59 130 246)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgb(59 130 246)',
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Giá đến"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                  }}
                  className="bg-white shadow-sm hover:shadow transition-shadow duration-300"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'rgb(59 130 246)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgb(59 130 246)',
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} className="flex justify-end mt-4">
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Đặt lại bộ lọc
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* Order Tabs */}
        <Paper className="mb-6 shadow-md hover:shadow-lg transition-shadow duration-300 max-w-6xl mx-auto dark:bg-dark-sidebar dark:text-dark-text">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
            className="border-b border-gray-200 dark:border-gray-700"
            TabIndicatorProps={{
              style: {
                backgroundColor: 'rgb(59 130 246)',
              }
            }}
            sx={{
              '& .MuiTab-root': {
                minHeight: '64px',
                '&.Mui-selected': {
                  color: 'rgb(59 130 246)',
                },
                '&.MuiTab-root': {
                  color: 'inherit',
                }
              }
            }}
          >
            {Object.entries(tabConfig).map(([key, config]) => (
              <Tab
                key={key}
                value={key}
                label={config.title}
                icon={config.icon}
                iconPosition="start"
                className={`
                  transition-all duration-300
                  ${selectedTab === key ? 'text-blue-500' : 'text-gray-600'}
                  hover:bg-gray-50
                `}
              />
            ))}
        </Tabs>
        </Paper>

        {/* Orders Table */}
        <TableContainer component={Paper} className="shadow-md max-w-6xl mx-auto dark:bg-dark-sidebar">
                <Table>
                  <TableHead>
              <TableRow className="bg-gray-50 dark:bg-dark-sidebar">
                <TableCell className="font-semibold dark:text-dark-text">Mã đơn hàng</TableCell>
                <TableCell className="font-semibold dark:text-dark-text">Khách hàng</TableCell>
                <TableCell className="font-semibold dark:text-dark-text">Tổng tiền</TableCell>
                <TableCell className="font-semibold dark:text-dark-text">Số lượng</TableCell>
                <TableCell className="font-semibold dark:text-dark-text">Ngày đặt</TableCell>
                <TableCell className="font-semibold dark:text-dark-text">Trạng thái</TableCell>
                <TableCell align="right" className="font-semibold dark:text-dark-text">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
              {invoicesData?.getInvoicesByShop.data.map((invoice) => (
                <TableRow 
                  key={invoice.invoice_id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors duration-150"
                >
                  <TableCell className="font-medium dark:text-dark-text">{invoice.invoice_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-medium dark:text-dark-text">{invoice.user?.user_name}</Typography>
                    <Typography variant="caption" className="text-gray-500 dark:text-dark-text">
                      {invoice.user?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell className="text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell className="dark:text-dark-text">{countTotalProducts(invoice)}</TableCell>
                  <TableCell className="dark:text-dark-text">{formatDate(invoice.create_at)}</TableCell>
                        <TableCell>{getStatusChip(invoice.order_status)}</TableCell>
                  <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, invoice.invoice_id)}
                      className="hover:bg-gray-100 dark:hover:bg-dark-hover dark:text-dark-text"
                              >
                                <MoreVertIcon />
                              </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

        {/* Pagination */}
        <Box className="flex justify-center mt-6">
                  <Pagination
            count={invoicesData?.getInvoicesByShop.totalPage || 1}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
            size="large"
            className="shadow-sm"
                  />
        </Box>

        {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleMenuClose}
      >
          <MenuItem onClick={() => handleViewDetail(menuInvoiceId!)}>
            <RemoveRedEyeIcon className="mr-2" /> Xem chi tiết
        </MenuItem>
          {selectedTab !== 'delivered' && 
           selectedTab !== 'canceled' && 
           selectedTab in tabConfig &&
           tabConfig[selectedTab as keyof typeof tabConfig]?.nextAction && (
            <MenuItem
              onClick={() =>
            handleActionClick(
                  menuInvoiceId!,
              tabConfig[selectedTab as keyof typeof tabConfig].nextAction!.status
            )
              }
            >
              {tabConfig[selectedTab as keyof typeof tabConfig].nextAction?.icon}
              <span className="ml-2">
                {tabConfig[selectedTab as keyof typeof tabConfig].nextAction?.label}
              </span>
            </MenuItem>
          )}
          {selectedTab === 'waiting_for_delivery' && (
            <MenuItem
              onClick={() =>
                handleActionClick(menuInvoiceId!, OrderStatus.CANCELED)
              }
            >
              <CancelIcon className="mr-2" /> Hủy đơn
          </MenuItem>
        )}
      </Menu>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialogOpen} onClose={handleCancel}>
        <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText>
              Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              onClick={handleConfirm}
              color="primary"
              disabled={updatingStatus}
            >
            {updatingStatus ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </LocalizationProvider>
  );
};

export default OrderManagementPage; 