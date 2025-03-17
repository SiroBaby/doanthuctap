'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from '@apollo/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GET_SHOP_ID_BY_USER_ID, GET_INVOICES_BY_SHOP } from '@/graphql/queries';
import { UPDATE_INVOICE_STATUS } from '@/graphql/mutations';
import { OrderStatus, InvoiceProduct } from './types';

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
  Tooltip,
} from '@mui/material';
import {
  AddAlert as AddAlertIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  RemoveRedEye as RemoveRedEyeIcon,
} from '@mui/icons-material';

interface ShopIdResponse {
  getShopIdByUserId: {
    shop_id: string;
  };
}

interface InvoicesResponse {
  getInvoicesByShop: {
    data: Array<{
      invoice_id: string;
      payment_method: string;
      payment_status: string;
      order_status: string;
      total_amount: number;
      shipping_fee: number;
      id_user: string;
      create_at: string;
      update_at: string;
      invoice_products: Array<InvoiceProduct>;
      user: {
        user_name: string;
        email: string;
        phone: string;
      };
    }>;
    totalCount: number;
    totalPage: number;
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

  const LIMIT = 10;

  // Map tab value to page title and status
  const tabConfig = {
    waiting_for_delivery: {
      title: 'Chờ lấy hàng',
      status: OrderStatus.WAITING_FOR_DELIVERY,
      nextAction: {
        label: 'Chuẩn bị hàng',
        status: OrderStatus.PROCESSED,
        icon: <CheckCircleIcon />,
      },
    },
    processed: {
      title: 'Đã xử lý',
      status: OrderStatus.PROCESSED,
      nextAction: {
        label: 'Vận chuyển',
        status: OrderStatus.DELIVERY,
        icon: <LocalShippingIcon />,
      },
    },
    delivery: {
      title: 'Đang vận chuyển',
      status: OrderStatus.DELIVERY,
      nextAction: {
        label: 'Đã giao',
        status: OrderStatus.DELIVERED,
        icon: <CheckCircleIcon />,
      },
    },
    delivered: {
      title: 'Đã giao',
      status: OrderStatus.DELIVERED,
      nextAction: null,
    },
    canceled: {
      title: 'Đã hủy',
      status: OrderStatus.CANCELED,
      nextAction: null,
    },
    out_of_stock: {
      title: 'Hết hàng',
      status: 'out_of_stock',
      nextAction: null,
    },
  };

  // Update URL when tab or page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', selectedTab);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [selectedTab, page, pathname, router, searchParams]);

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

  // Fetch invoices
  const { loading: invoicesLoading, error: invoicesError, data: invoicesData, refetch: refetchInvoices } = 
    useQuery<InvoicesResponse>(GET_INVOICES_BY_SHOP, {
    variables: {
      getInvoicesByShopInput: {
        shop_id: shopId,
        order_status: selectedTab !== 'out_of_stock' ? tabConfig[selectedTab as keyof typeof tabConfig].status : undefined,
        page,
        limit: LIMIT,
      },
    },
    skip: !shopId || selectedTab === 'out_of_stock',
  });

  // Update invoice status mutation
  const [updateInvoiceStatus, { loading: updatingStatus }] = useMutation(UPDATE_INVOICE_STATUS, {
    onCompleted: () => {
      refetchInvoices();
      setConfirmDialogOpen(false);
      setSelectedInvoice(null);
      setNextStatus(null);
    },
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    setPage(1);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count total products in an invoice
  const countTotalProducts = (invoice: { invoice_products?: Array<InvoiceProduct> }) => {
    if (!invoice?.invoice_products) return 0;
    return invoice.invoice_products.reduce((total: number, product: InvoiceProduct) => total + product.quantity, 0);
  };

  const loading = shopIdLoading || invoicesLoading;
  const error = invoicesError;
  const invoices = invoicesData?.getInvoicesByShop.data || [];
  const totalPages = invoicesData?.getInvoicesByShop.totalPage || 0;

  if (!userId) {
    return (
      <Container className="p-6">
        <Alert severity="warning">
          Vui lòng đăng nhập để quản lý đơn hàng
        </Alert>
      </Container>
    );
  }

  if (selectedTab === 'out_of_stock') {
    router.push('/seller/order/out-of-stock');
    return null;
  }

  return (
    <Container className="py-6">
      <Box className="mb-6">
        <Typography variant="h4" component="h1" className="mb-2 font-bold">
          Quản lý đơn hàng
        </Typography>
        <Typography color="textSecondary">
          Theo dõi và quản lý các đơn hàng của cửa hàng
        </Typography>
      </Box>

      <Paper>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b border-gray-200"
        >
          <Tab
            value="waiting_for_delivery"
            label={
              <Box className="flex items-center">
                <AddAlertIcon className="mr-1" fontSize="small" />
                Chờ lấy hàng
              </Box>
            }
          />
          <Tab
            value="processed"
            label={
              <Box className="flex items-center">
                <CheckCircleIcon className="mr-1" fontSize="small" />
                Đã xử lý
              </Box>
            }
          />
          <Tab
            value="delivery"
            label={
              <Box className="flex items-center">
                <LocalShippingIcon className="mr-1" fontSize="small" />
                Vận chuyển
              </Box>
            }
          />
          <Tab
            value="delivered"
            label={
              <Box className="flex items-center">
                <CheckCircleIcon className="mr-1" fontSize="small" />
                Đã giao
              </Box>
            }
          />
          <Tab
            value="canceled"
            label={
              <Box className="flex items-center">
                <CancelIcon className="mr-1" fontSize="small" />
                Đã hủy
              </Box>
            }
          />
          <Tab
            value="out_of_stock"
            label={
              <Box className="flex items-center">
                <InventoryIcon className="mr-1" fontSize="small" />
                Hết hàng
              </Box>
            }
          />
        </Tabs>

        <Box className="p-4">
          <Typography variant="h6" className="mb-4">
            {tabConfig[selectedTab as keyof typeof tabConfig].title}
          </Typography>

          {loading ? (
            <Box>
              {[...Array(3)].map((_, index) => (
                <Box key={index} className="mb-4">
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error">
              Đã xảy ra lỗi khi tải dữ liệu: {error.message}
            </Alert>
          ) : invoices.length === 0 ? (
            <Box className="py-10 text-center">
              <Typography variant="h6" color="textSecondary">
                Không có đơn hàng nào
              </Typography>
              <Typography color="textSecondary">
                Hiện không có đơn hàng nào trong trạng thái này
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn hàng</TableCell>
                      <TableCell>Ngày đặt</TableCell>
                      <TableCell>Người đặt</TableCell>
                      <TableCell>Số sản phẩm</TableCell>
                      <TableCell>Tổng tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoice_id}>
                        <TableCell>{invoice.invoice_id}</TableCell>
                        <TableCell>{formatDate(invoice.create_at)}</TableCell>
                        <TableCell>{invoice.user.user_name}</TableCell>
                        <TableCell>{countTotalProducts(invoice)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{getStatusChip(invoice.order_status)}</TableCell>
                        <TableCell>
                          <Box className="flex">
                            <Tooltip title="Tùy chọn">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, invoice.invoice_id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box className="flex justify-center mt-4">
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
        </Box>
      </Paper>

      {/* Action menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuInvoiceId && handleViewDetail(menuInvoiceId)}>
          <RemoveRedEyeIcon fontSize="small" className="mr-2" />
          Xem chi tiết
        </MenuItem>
        
        {tabConfig[selectedTab as keyof typeof tabConfig].nextAction && (
          <MenuItem onClick={() => 
            menuInvoiceId && 
            handleActionClick(
              menuInvoiceId, 
              tabConfig[selectedTab as keyof typeof tabConfig].nextAction!.status
            )
          }>
            {tabConfig[selectedTab as keyof typeof tabConfig].nextAction!.icon}
            <span className="ml-2">{tabConfig[selectedTab as keyof typeof tabConfig].nextAction!.label}</span>
          </MenuItem>
        )}
      </Menu>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này thành{' '}
            {nextStatus === OrderStatus.PROCESSED && 'Đã xử lý'}
            {nextStatus === OrderStatus.DELIVERY && 'Đang vận chuyển'}
            {nextStatus === OrderStatus.DELIVERED && 'Đã giao hàng'}
            {nextStatus === OrderStatus.CANCELED && 'Đã hủy'} không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" disabled={updatingStatus}>
            {updatingStatus ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagementPage; 