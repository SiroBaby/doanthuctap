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
import { GET_VOUCHERS } from '@/graphql/queries';
import { REMOVE_VOUCHER } from '@/graphql/mutations';
import SearchBar from '@/app/components/common/SearchBar';
import DeleteDialog from '@/app/components/common/DeleteDialog';
import moment from 'moment-timezone';

interface Voucher {
    id: string;
    code: string;
    discount_percent: number;
    minimum_require_price: number;
    max_discount_price: number;
    quantity: number;
    valid_to: string;
    delete_at: string | null;
}

interface VouchersResponse {
    vouchers: {
        data: Voucher[];
        totalCount: number;
        totalPage: number;
    };
}

const VoucherPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();

    // State cho hộp thoại xác nhận xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);

    // State for notification
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Memoize query variables
    const queryVariables = useMemo(() => ({
        page,
        limit,
        search
    }), [page, limit, search]);

    const { data, loading, error, refetch } = useQuery<VouchersResponse>(GET_VOUCHERS, {
        variables: queryVariables,
        fetchPolicy: 'network-only'
    });

    // Mutation xóa voucher
    const [deleteVoucher, { loading: deleteLoading }] = useMutation(REMOVE_VOUCHER, {
        onCompleted: () => {
            setSnackbarMessage('Xóa voucher thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            refetch(); // Tải lại danh sách voucher
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi xóa voucher: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

    // Memoize derived data
    const vouchers = useMemo(() => data?.vouchers.data || [], [data]);
    const totalPages = useMemo(() => data?.vouchers.totalPage || 0, [data]);

    // Handlers
    const handleViewVoucher = useCallback((id: string) => {
        router.push(`/admin/voucher/detail/${id}`);
    }, [router]);

    const handleEditVoucher = useCallback((id: string) => {
        router.push(`/admin/voucher/edit/${id}`);
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
        setSnackbarOpen(false);
    }, []);

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

        const getStatusColor = (status: string) => {
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
                label={status}
                color={getStatusColor(status)}
            />
        );
    };

    // Check if voucher is deleted
    const isVoucherDeleted = (deleteAt: string | null) => !!deleteAt;

    // Loading state
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải vouchers...</Typography>
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
                                buttonText="Search"
                            />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => router.push('/admin/voucher/add')}
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
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Mã Voucher</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">% Giảm</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Giá tối thiểu</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Giảm tối đa</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Số lượng</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Hết hạn</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Trạng thái</TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vouchers.map((voucher) => {
                                                const isDeleted = isVoucherDeleted(voucher.delete_at);
                                                return (
                                                    <TableRow
                                                        key={voucher.id}
                                                        className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                    >
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.id}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.code}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{(voucher.discount_percent * 100).toFixed(0)}%</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.minimum_require_price.toLocaleString()}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.max_discount_price.toLocaleString()}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{voucher.quantity}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">{moment(voucher.valid_to).format('DD/MM/YYYY')}</TableCell>
                                                        <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                            <StatusChip validTo={voucher.valid_to} deleteAt={voucher.delete_at} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                aria-label="detail"
                                                                title="Xem chi tiết voucher"
                                                                onClick={() => handleViewVoucher(voucher.id)}
                                                                className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                                size="small"
                                                            >
                                                                <ViewListIcon className="!w-7 !h-6" />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="edit"
                                                                title="Chỉnh sửa voucher"
                                                                onClick={() => handleEditVoucher(voucher.id)}
                                                                className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900 disabled:!text-blue-200 dark:disabled:!text-blue-800"
                                                                size="small"
                                                                disabled={isDeleted}
                                                            >
                                                                <EditNoteIcon className="!w-7 !h-6" />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="delete"
                                                                title="Xóa voucher"
                                                                onClick={() => handleDeleteClick(parseInt(voucher.id, 10))}
                                                                className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900 disabled:!text-red-200 dark:disabled:!text-red-800"
                                                                size="small"
                                                                disabled={isDeleted}
                                                            >
                                                                <DeleteIcon className="!w-7 !h-6" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
                                            color="error"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                title="Xác nhận xóa voucher"
                contentText="Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác."
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
            />

            {/* Result notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
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

export default VoucherPage;