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
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import {GET_PRODUCTS_BY_SHOP_ID, GET_SHOP_ID_BY_USER_ID} from '@/graphql/queries';
import { REMOVE_PRODUCT } from '@/graphql/mutations';
import { useAuth } from "@clerk/nextjs";
import SearchBar from '@/app/components/common/SearchBar';

// Interface cho Product từ query mới
interface Product {
    product_id: string;
    product_name: string;
    brand: string;
    status: string;
}

// Interface cho response từ query GET_PRODUCTS_BY_SHOP_ID
interface ProductsResponse {
    getProductsByShopId: {
        data: Product[];
        totalCount: number;
        totalPage: number;
    };
}

const SellerProductPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();
    const { userId } = useAuth();

    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Query để lấy thông tin user
    const { data: userDataResponse, loading: isUserLoading } = useQuery(GET_SHOP_ID_BY_USER_ID, {
        variables: { id: userId },
        skip: !userId
    });

    // Giả sử shopId nằm trong userData (điều chỉnh theo schema thực tế)
    const shopId = userDataResponse?.getShopIdByUserId?.shop_id; // Có thể cần đổi thành field khác như shop_id

    const queryVariables = useMemo(() => ({
        id: shopId, // Sử dụng "id" thay vì "shopId" theo query mới
        page,
        limit,
        search
    }), [page, limit, search, shopId]);

    const { data, loading, error, refetch } = useQuery<ProductsResponse>(GET_PRODUCTS_BY_SHOP_ID, {
        variables: queryVariables,
        fetchPolicy: 'network-only',
        skip: !shopId // Bỏ qua query nếu chưa có shopId
    });

    const products = useMemo(() => {
        const allProducts = data?.getProductsByShopId.data || [];
        // Lọc ra các sản phẩm không bị xóa (status khác 'delete')
        return allProducts.filter(product => product.status !== 'delete');
    }, [data]);
    
    const totalPages = useMemo(() => data?.getProductsByShopId.totalPage || 0, [data]);

    const handleViewProduct = useCallback((id: string) => {
        router.push(`/seller/product/detail/${id}`);
    }, [router]);

    const handleEditProduct = useCallback((id: string) => {
        router.push(`/seller/product/edit/${id}`);
    }, [router]);

    const handleAddProduct = useCallback(() => {
        router.push(`/seller/product/add/${shopId}`);
    }, [router, shopId]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1);
    }, []);

    const StatusChip = ({ status }: { status: string }) => {
        const normalizedStatus = status === null ? 'active' : status;

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'active':
                    return 'success';
                case 'delete':
                    return 'error';
                default:
                    return 'warning';
            }
        };

        return (
            <Chip
                label={normalizedStatus}
                color={getStatusColor(normalizedStatus)}
            />
        );
    };

    // Add delete product mutation
    const [removeProduct, { loading: deleteLoading }] = useMutation(REMOVE_PRODUCT, {
        onCompleted: () => {
            setSnackbarMessage('Xóa sản phẩm thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            refetch(); // Refresh product list
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi xóa sản phẩm: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

    const handleDeleteProduct = useCallback((id: string) => {
        setProductToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (productToDelete) {
            removeProduct({
                variables: {
                    productId: parseInt(productToDelete)
                }
            });
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    }, [productToDelete, removeProduct]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    }, []);

    if (isUserLoading || loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải sản phẩm...</Typography>
            </div>
        );
    }

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

    const showEmptyState = products.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex-grow mr-3">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Tìm kiếm sản phẩm theo id hoặc tên sản phẩm..."
                                initialValue={search}
                                buttonText="Search"
                            />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddProduct}
                            className="!ml-3"
                        >
                            Thêm sản phẩm
                        </Button>
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex flex-col items-center justify-center p-8">
                                <Typography variant="h6" className="dark:!text-gray-300 mb-4">
                                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddProduct}
                                >
                                    Thêm sản phẩm mới
                                </Button>
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
                                                    Tên sản phẩm
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Thương hiệu
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
                                            {products.map((product) => (
                                                <TableRow
                                                    key={product.product_id}
                                                    className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                >
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {product.product_id}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {product.product_name}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {product.brand}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <StatusChip status={product.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="detail"
                                                            title="Xem chi tiết sản phẩm"
                                                            onClick={() => handleViewProduct(product.product_id)}
                                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                            size="small"
                                                        >
                                                            <ViewListIcon className="!w-7 !h-6" />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="edit"
                                                            title="Chỉnh sửa sản phẩm"
                                                            onClick={() => handleEditProduct(product.product_id)}
                                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                            size="small"
                                                        >
                                                            <EditIcon className="!w-7 !h-6" />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            title="Xóa sản phẩm"
                                                            onClick={() => handleDeleteProduct(product.product_id)}
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
                                            color='primary'
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Dialog for confirming product deletion */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Xác nhận xóa sản phẩm"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        autoFocus
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </Button>
                </DialogActions>
            </Dialog>

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

export default SellerProductPage;