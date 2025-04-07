/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
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
    Button,
    Snackbar,
    Chip
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_SHOPS } from '@/graphql/queries'; // Import truy vấn GET_SHOPS
import SearchBar from '@/app/components/common/SearchBar';

// Định nghĩa interface cho Shop và response từ GraphQL
interface Shop {
    shop_id: string;
    id_user: string;
    shop_name: string;
    status: string;
    location_id: string;
}

interface ShopsResponse {
    shops: {
        data: Shop[];
        totalCount: number;
        totalPage: number;
    };
}

const ShopsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();

    // State cho thông báo
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Memoize query variables
    const queryVariables = useMemo(() => ({
        page,
        limit,
        search
    }), [page, limit, search]);

    // Sử dụng useQuery để lấy danh sách cửa hàng
    const { data, loading, error, refetch } = useQuery<ShopsResponse>(GET_SHOPS, {
        variables: queryVariables,
        fetchPolicy: 'network-only'
    });

    // Memoize dữ liệu để tránh render không cần thiết
    const shops = useMemo(() => data?.shops.data || [], [data]);
    const totalPages = useMemo(() => data?.shops.totalPage || 0, [data]);

    // Handlers
    const handleViewShop = useCallback((id: string) => {
        router.push(`/admin/shop/detail/${id}`);
    }, [router]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1); // Reset về trang đầu khi tìm kiếm
    }, []);

    // Component hiển thị trạng thái
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
            />
        );
    };

    // Trạng thái loading
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải danh sách cửa hàng...</Typography>
            </div>
        );
    }

    // Trạng thái lỗi
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

    // Trạng thái không có dữ liệu
    const showEmptyState = shops.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex-grow mr-3">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Tìm kiếm cửa hàng theo id hoặc tên cửa hàng..."
                                initialValue={search}
                                buttonText="Search"
                            />
                        </div>
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex items-center justify-center p-8">
                                <Typography variant="h6" className='dark:!text-gray-300'>
                                    Không tìm thấy cửa hàng nào phù hợp với tiêu chí tìm kiếm
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-auto">
                                    <Table stickyHeader className="min-w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    ID
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Tên cửa hàng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    ID Người dùng
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Vị trí (Location ID)
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Trạng thái
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Thao tác
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {shops.map((shop) => (
                                                <TableRow
                                                    key={shop.shop_id}
                                                    className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                >
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {shop.shop_id}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {shop.shop_name}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {shop.id_user}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {shop.location_id || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <StatusChip status={shop.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="detail"
                                                            title="Xem chi tiết cửa hàng"
                                                            onClick={() => handleViewShop(shop.shop_id)}
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
                                            size="large"
                                            color='primary'
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Thông báo kết quả */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ShopsPage;