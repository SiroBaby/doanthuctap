'use client'
import React, { useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Pagination,
    Alert,
    Button
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ALL_INVOICES } from '@/graphql/queries';
import SearchBar from '@/app/components/common/SearchBar';
import { formatCurrency, formatDate } from '@/app/utils/format';

interface Invoice {
    invoice_id: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    total_amount: number;
    shipping_fee: number;
    id_user: string;
    shop_id: string;
    create_at: string;
    update_at: string;
    user: {
        user_name: string;
        email: string;
        phone: string;
    };
    shop: {
        shop_name: string;
    };
}

interface InvoicesResponse {
    getAllInvoices: {
        data: Invoice[];
        totalCount: number;
        totalPage: number;
    };
}

// Status chip component for reusability
const StatusChip = ({ status }: { status: string }) => {
    // Handle null status
    const normalizedStatus = status === null ? 'WAITING_FOR_DELIVERY' : status;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING_FOR_DELIVERY':
                return 'warning';
            case 'PROCESSED':
                return 'info';
            case 'DELIVERY':
                return 'primary';
            case 'DELIVERED':
                return 'success';
            case 'CANCELED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'WAITING_FOR_DELIVERY':
                return 'Chờ lấy hàng';
            case 'PROCESSED':
                return 'Đã xử lý';
            case 'DELIVERY':
                return 'Đang vận chuyển';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <Chip
            label={getStatusLabel(normalizedStatus)}
            color={getStatusColor(normalizedStatus) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'}
        />
    );
};

// Payment status chip
const PaymentStatusChip = ({ status }: { status: string }) => {
    // Handle null status
    const normalizedStatus = status === null ? 'pending' : status;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return status;
        }
    };

    return (
        <Chip
            label={getStatusLabel(normalizedStatus)}
            color={getStatusColor(normalizedStatus) as 'warning' | 'success' | 'error' | 'default'}
        />
    );
};

const OrderPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
    const limit = 10;
    const router = useRouter();

    // Memoize query variables to prevent unnecessary rerenders
    const queryVariables = useMemo(() => ({
        getAllInvoicesInput: {
            page,
            limit,
            search: search || undefined,
            order_status: orderStatus || undefined
        }
    }), [page, limit, search, orderStatus]);

    const { data, loading, error } = useQuery<InvoicesResponse>(GET_ALL_INVOICES, {
        variables: queryVariables,
        fetchPolicy: 'network-only'
    });

    // Memoize derived data
    const invoices = useMemo(() => data?.getAllInvoices.data || [], [data]);
    const totalPages = useMemo(() => data?.getAllInvoices.totalPage || 0, [data]);

    // Memoize handlers to prevent recreating functions on each render
    const handleDetailOrder = useCallback((id: string) => {
        router.push(`/admin/order/detail/${id}`);
    }, [router]);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    // Handle search from SearchBar component
    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1); // Reset to first page when searching
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải đơn hàng...</Typography>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Lỗi khi tải dữ liệu</Typography>
                    <Typography>{error.message || 'Đã xảy ra lỗi không xác định'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </Button>
            </div>
        );
    }

    // Empty state
    const showEmptyState = invoices.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Tìm kiếm đơn hàng theo ID, tên khách hàng hoặc email..."
                            initialValue={search}
                            buttonText="Tìm kiếm"
                        />
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            <Button 
                                variant={orderStatus === null ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus(null)}
                            >
                                Tất cả
                            </Button>
                            <Button 
                                variant={orderStatus === 'WAITING_FOR_DELIVERY' ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus('WAITING_FOR_DELIVERY')}
                            >
                                Chờ lấy hàng
                            </Button>
                            <Button 
                                variant={orderStatus === 'PROCESSED' ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus('PROCESSED')}
                            >
                                Đã xử lý
                            </Button>
                            <Button 
                                variant={orderStatus === 'DELIVERY' ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus('DELIVERY')}
                            >
                                Đang vận chuyển
                            </Button>
                            <Button 
                                variant={orderStatus === 'DELIVERED' ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus('DELIVERED')}
                            >
                                Đã giao
                            </Button>
                            <Button 
                                variant={orderStatus === 'CANCELED' ? "contained" : "outlined"} 
                                size="small"
                                onClick={() => setOrderStatus('CANCELED')}
                            >
                                Đã hủy
                            </Button>
                        </div>
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex items-center justify-center p-8">
                                <Typography variant="h6" className='dark:!text-gray-300'>
                                    Không tìm thấy đơn hàng nào phù hợp với tiêu chí tìm kiếm
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-auto">
                                    <Table stickyHeader className="min-w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Mã đơn hàng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Khách hàng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Cửa hàng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Tổng tiền
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Trạng thái đơn hàng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Trạng thái thanh toán
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Ngày tạo
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Thao tác
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {invoices.map((invoice) => (
                                                <TableRow
                                                    key={invoice.invoice_id}
                                                    className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                >
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {invoice.invoice_id}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <div>{invoice.user.user_name}</div>
                                                        <div className="text-sm text-gray-500">{invoice.user.email}</div>
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {invoice.shop.shop_name}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {formatCurrency(invoice.total_amount + invoice.shipping_fee)}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <StatusChip status={invoice.order_status} />
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <PaymentStatusChip status={invoice.payment_status} />
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {formatDate(invoice.create_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="detail"
                                                            title="Xem chi tiết"
                                                            onClick={() => handleDetailOrder(invoice.invoice_id)}
                                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                            size="small"
                                                        >
                                                            <ViewListIcon className="!w-7 !h-6" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {totalPages > 0 && (
                                    <div className="flex justify-center p-4">
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handleChangePage}
                                            color="primary"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderPage;