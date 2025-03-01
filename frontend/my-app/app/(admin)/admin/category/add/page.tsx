'use client';
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    TextField,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '@/graphql/mutations';

const AddCategoryPage = () => {
    const router = useRouter();

    // Form state
    const [categoryName, setCategoryName] = useState('');
    const [nameError, setNameError] = useState('');

    // Alert state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Create category mutation
    const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
        onCompleted: () => {
            setSnackbarMessage('Tạo danh mục thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            // Redirect sau 1 giây
            setTimeout(() => {
                router.push('/admin/category');
            }, 1000);
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi tạo danh mục: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

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

        createCategory({
            variables: {
                createCategoryInput: {
                    category_name: categoryName
                }
            }
        });
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 dark:bg-dark-body">
            <div className="p-6">
                <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                    <CardContent>
                        <Typography variant="h4" className="!text-gray-700 dark:!text-gray-200 !font-bold mb-6">
                            Thêm danh mục mới
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap={3}
                            >
                                <TextField
                                    label="Tên danh mục"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    error={!!nameError}
                                    helperText={nameError}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    placeholder="Nhập tên danh mục mới"
                                    InputProps={{
                                        className: "bg-white dark:bg-gray-300"
                                    }}
                                />

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
                                        disabled={creating}
                                    >
                                        {creating ? (
                                            <>
                                                <CircularProgress size={20} color="inherit" className="mr-2" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            'Tạo danh mục'
                                        )}
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

export default AddCategoryPage;
