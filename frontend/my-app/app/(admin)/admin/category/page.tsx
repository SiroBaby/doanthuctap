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
    Snackbar
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '@/graphql/queries';
import { REMOVE_CATEGORY } from '@/graphql/mutations';
import SearchBar from '@/app/components/common/SearchBar';
import DeleteDialog from '@/app/components/common/DeleteDialog'; // Thêm import mới
import moment from 'moment-timezone';

interface Category {
    category_id: string;
    category_name: string;
    create_at: string;
    update_at: string;
}

interface CategoriesResponse {
    categorys: {
        data: Category[];
        totalCount: number;
        totalPage: number;
    };
}

const CategoryPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();

    // State cho hộp thoại xác nhận xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    // State cho thông báo kết quả
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Mutation xóa danh mục
    const [deleteCategory, { loading: deleteLoading }] = useMutation(REMOVE_CATEGORY, {
        onCompleted: () => {
            setSnackbarMessage('Xóa danh mục thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            refetch(); // Tải lại danh sách danh mục
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi xóa danh mục: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

    // Memoize query variables
    const queryVariables = useMemo(() => ({
        page,
        limit,
        search
    }), [page, limit, search]);

    const { data, loading, error, refetch } = useQuery<CategoriesResponse>(GET_CATEGORIES, {
        variables: queryVariables,
        fetchPolicy: 'network-only'
    });

    // Memoize derived data
    const categories = useMemo(() => data?.categorys.data || [], [data]);
    const totalPages = useMemo(() => data?.categorys.totalPage || 0, [data]);

    // Format date function sử dụng moment-timezone với múi giờ Việt Nam
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return moment(dateString).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return "Invalid date";
        }
    };

    // Handlers
    const handleEditCategory = useCallback((id: string) => {
        router.push(`/admin/category/edit/${id}`);
    }, [router]);

    const handleDeleteClick = useCallback((id: number) => {
        setCategoryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (categoryToDelete) {
            deleteCategory({
                variables: {
                    id: categoryToDelete
                }
            });
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    }, [categoryToDelete, deleteCategory]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải danh mục...</Typography>
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
    const showEmptyState = categories.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex-grow mr-3">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Tìm kiếm danh mục..."
                                initialValue={search}
                                buttonText="Seach"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            onClick={() => router.push('/admin/category/add')}
                            className="whitespace-nowrap h-10"
                            startIcon={<AddIcon />}
                        >
                            Thêm danh mục
                        </Button>
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex items-center justify-center p-8 ">
                                <Typography variant="h6" className=' dark:!text-gray-300'>
                                    Không tìm thấy danh mục nào phù hợp với tiêu chí tìm kiếm
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
                                                    Tên danh mục
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Ngày tạo
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Cập nhật lần cuối
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Thao tác
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {categories.map((category) => (
                                                <TableRow
                                                    key={category.category_id}
                                                    className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                >
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {category.category_id}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {category.category_name}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {formatDate(category.create_at)}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {formatDate(category.update_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="edit"
                                                            title="Chỉnh sửa danh mục"
                                                            onClick={() => handleEditCategory(category.category_id)}
                                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                            size="small"
                                                        >
                                                            <EditNoteIcon className="!w-7 !h-6" />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            title="Xóa danh mục"
                                                            onClick={() => handleDeleteClick(parseInt(category.category_id, 10))}
                                                            className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900"
                                                            size="small"
                                                        >
                                                            <DeleteIcon className="!w-7 !h-6" />
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
                                            color='error'
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Sử dụng component DeleteDialog thay vì Dialog trực tiếp */}
            <DeleteDialog
                open={deleteDialogOpen}
                title="Xác nhận xóa danh mục"
                contentText="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
            />

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

export default CategoryPage;
