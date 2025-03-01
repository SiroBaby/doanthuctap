'use client';
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
    Box,
    Alert,
    TextField,
    Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORY_BY_ID } from '@/graphql/queries';
import { UPDATE_CATEGORY } from '@/graphql/mutations';
import moment from 'moment-timezone';

interface Category {
    category_id: string;
    category_name: string;
    create_at: string;
    update_at: string;
}

interface CategoryResponse {
    category: Category;
}

const EditCategoryPage = () => {
    const router = useRouter();
    const params = useParams();
    const categoryId = parseInt(String(params.id), 10);

    // Form state
    const [categoryName, setCategoryName] = useState('');
    const [nameError, setNameError] = useState('');

    // Alert state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Fetch category data
    const { data, loading, error } = useQuery<CategoryResponse>(GET_CATEGORY_BY_ID, {
        variables: { id: categoryId },
        fetchPolicy: 'network-only'
    });

    // Update mutation
    const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
        onCompleted: () => {
            setSnackbarMessage('Cập nhật danh mục thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            // Redirect sau 1 giây
            setTimeout(() => {
                router.push('/admin/category');
            }, 1000);
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi cập nhật danh mục: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

    // Populate form with current data
    useEffect(() => {
        if (data?.category) {
            setCategoryName(data.category.category_name);
        }
    }, [data]);

    // Format date function
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return moment(dateString).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm');
        } catch (e) {
            return "Invalid date";
        }
    };

    // Form validation
    const validateForm = () => {
        let isValid = true;

        if (!categoryName.trim()) {
            setNameError('Tên danh mục không được để trống');
            isValid = false;
        } else {
            setNameError('');
        }

        return isValid;
    };

    // Handle submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        updateCategory({
            variables: {
                updateCategoryInput: {
                    category_id: categoryId,
                    category_name: categoryName
                }
            }
        });
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải thông tin danh mục...</Typography>
            </div>
        );
    }

    if (error || !data?.category) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Lỗi khi tải dữ liệu</Typography>
                    <Typography>{error?.message || 'Không tìm thấy danh mục hoặc đã xảy ra lỗi không xác định.'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/admin/category')}
                >
                    Quay lại
                </Button>
            </div>
        );
    }

    const category = data.category;

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 dark:bg-dark-body">
            <div className="p-6">
                <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                    <CardContent>
                        <Typography variant="h4" className="!text-gray-700 dark:!text-gray-200 !font-bold mb-6">
                            Chỉnh sửa danh mục
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap={3}
                            >
                                <TextField
                                    label="ID"
                                    value={category.category_id}
                                    disabled
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        className: "bg-white dark:bg-gray-300"
                                    }}
                                />

                                <TextField
                                    label="Tên danh mục"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    error={!!nameError}
                                    helperText={nameError}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        className: "bg-white dark:bg-gray-300"
                                    }}
                                />

                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={1}
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
                                >
                                    <Typography className="!text-gray-600 dark:!text-gray-300">
                                        <strong>Ngày tạo:</strong> {formatDate(category.create_at)}
                                    </Typography>
                                    <Typography className="!text-gray-600 dark:!text-gray-300">
                                        <strong>Cập nhật lần cuối:</strong> {formatDate(category.update_at)}
                                    </Typography>
                                </Box>

                                <Box display="flex" gap={2} justifyContent="flex-start" mt={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => router.push('/admin/category')}
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        disabled={updating}
                                    >
                                        {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Thông báo kết quả */}
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

export default EditCategoryPage;
