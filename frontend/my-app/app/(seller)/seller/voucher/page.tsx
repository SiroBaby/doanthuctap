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
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SHOP_VOUCHERS_BY_SHOP_ID, GET_SHOP_ID_BY_USER_ID } from '@/graphql/queries';
import { REMOVE_SHOP_VOUCHER } from '@/graphql/mutations';
import SearchBar from '@/app/components/common/SearchBar';
import DeleteDialog from '@/app/components/common/DeleteDialog';
import moment from 'moment-timezone';
import { useAuth } from '@clerk/nextjs';

interface ShopVoucher {
    id: string;
    code: string;
    discount_percent: number;
    minimum_require_price: number;
    max_discount_price: number;
    quantity: number;
    valid_to: string;
    delete_at: string | null;
}

interface ShopVouchersResponse {
    getShopVouchersByShopId: {
        data: ShopVoucher[];
        totalCount: number;
        totalPage: number;
    };
}

interface ShopIdResponse {
    getShopIdByUserId: {
        shop_id: string;
    };
}

const ShopVoucherPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();
    const { userId } = useAuth();
    const [shopId, setShopId] = useState<string | null>(null);

    // State cho hộp thoại xác nhận xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);

    // State for notification
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Fetch shop_id from user_id
    const { loading: shopIdLoading } = useQuery<ShopIdResponse>(GET_SHOP_ID_BY_USER_ID, {
        variables: { id: userId },
        skip: !userId,
        onCompleted: (data) => {
            if (data?.getShopIdByUserId?.shop_id) {
                setShopId(data.getShopIdByUserId.shop_id);
            }
        },
    });

    // Memoize query variables
    const queryVariables = useMemo(() => ({
        shopId: shopId || '',
        page,
        limit,
        search
    }), [shopId, page, limit, search]);

    const { data, loading, error, refetch } = useQuery<ShopVouchersResponse>(GET_SHOP_VOUCHERS_BY_SHOP_ID, {
        variables: queryVariables,
        skip: !shopId,
        fetchPolicy: 'network-only'
    });

    // Mutation xóa voucher
    const [deleteVoucher, { loading: deleteLoading }] = useMutation(REMOVE_SHOP_VOUCHER, {
        onCompleted: () => {
            setSnackbar({
                open: true,
                message: 'Xóa voucher thành công!',
                severity: 'success',
            });
            refetch(); // Tải lại danh sách voucher
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message: `Lỗi khi xóa voucher: ${error.message}`,
                severity: 'error',
            });
        }
    });

    // Memoize derived data
    const vouchers = useMemo(() => data?.getShopVouchersByShopId.data || [], [data]);
    const totalPages = useMemo(() => data?.getShopVouchersByShopId.totalPage || 0, [data]);

    // Handlers
    const handleViewVoucher = useCallback((id: string) => {
        router.push(`/seller/voucher/detail/${id}`);
    }, [router]);

    const handleEditVoucher = useCallback((id: string) => {
        router.push(`/seller/voucher/edit/${id}`);
    }, [router]);

    const handleDeleteClick = useCallback((id: number) => {
        setVoucherToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setVoucherToDelete(null);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (voucherToDelete) {
            deleteVoucher({
                variables: {
                    id: voucherToDelete
                }
            });
            setDeleteDialogOpen(false);
            setVoucherToDelete(null);
        }
    }, [voucherToDelete, deleteVoucher]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    }, [snackbar]);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1); // Reset to first page when searching
    }, []);

    const StatusChip = ({ validTo, deleteAt }: { validTo: string; deleteAt: string | null }) => {
        let status = 'active';
        if (deleteAt) {
            status = 'delete';
        } else if (moment(validTo).isBefore(moment())) {
            status = 'expired';
        }

        const getStatusColor = (status: string): "success" | "error" | "warning" | "default" | "primary" | "secondary" | "info" => {
            switch (status) {
                case 'active':
                    return 'success';
                case 'delete':
                    return 'error';
                case 'expired':
                    return 'warning';
                default:
                    return 'default';
            }
        };

        return (
            <Chip
                label={status === 'active' ? 'active' : 
                      status === 'delete' ? 'delete' : 'inactive'}
                color={getStatusColor(status)}
            />
        );
    };

    // Loading state
    if (shopIdLoading || (loading && shopId)) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải dữ liệu voucher...</Typography>
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
    const showEmptyState = vouchers.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex-grow mr-3">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Tìm kiếm voucher theo mã hoặc id..."
                                initialValue={search}
                                buttonText="SEARCH"
                            />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => router.push('/seller/voucher/add')}
                            className="whitespace-nowrap h-10"
                            startIcon={<AddIcon />}
                        >
                            Thêm voucher
                        </Button>
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex items-center justify-center p-8">
                                <Typography variant="h6" className='dark:!text-gray-300'>
                                    Không tìm thấy voucher nào phù hợp với tiêu chí tìm kiếm
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-auto">
                                    <Table stickyHeader className="min-w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">ID</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Voucher Code</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">% Discount</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Minimum Require Price</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Maximum Discount Price</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Quantity</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Expired Date</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Status</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vouchers.map((voucher) => {
                                                const isDeleted = !!voucher.delete_at;
                                                return (
                                                    <TableRow
                                                        key={voucher.id}
                                                        className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                    >
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.id}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.code}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{(voucher.discount_percent * 100).toFixed(0)}%</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.minimum_require_price.toLocaleString()} đ</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.max_discount_price.toLocaleString()} đ</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.quantity}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{moment(voucher.valid_to).format('DD/MM/YYYY')}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                            <StatusChip validTo={voucher.valid_to} deleteAt={voucher.delete_at} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-1">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => handleViewVoucher(voucher.id)}
                                                                    size="small"
                                                                >
                                                                    <ViewListIcon />
                                                                </IconButton>
                                                                {!isDeleted && (
                                                                    <>
                                                                        <IconButton
                                                                            color="success"
                                                                            onClick={() => handleEditVoucher(voucher.id)}
                                                                            size="small"
                                                                        >
                                                                            <EditNoteIcon />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() => handleDeleteClick(Number(voucher.id))}
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="p-3 flex justify-center">
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handleChangePage}
                                        color="primary"
                                    />
                                </div>
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            <DeleteDialog
                open={deleteDialogOpen}
                title="Xác nhận xóa voucher"
                contentText={`Bạn có chắc chắn muốn xóa voucher ${voucherToDelete ? vouchers.find(v => v.id === voucherToDelete.toString())?.code : ''} không?`}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
            />

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
        </div>
    );
};

export default ShopVoucherPage; 