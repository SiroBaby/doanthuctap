'use client'

import React, { useState, useCallback, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    Box,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_SHOP_VOUCHER } from '@/graphql/mutations';
import { GET_SHOP_VOUCHER_BY_ID } from '@/graphql/queries';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment-timezone';

interface ShopVoucherResponse {
    shopVoucher: {
        id: number;
        code: string;
        discount_percent: number;
        minimum_require_price: number;
        max_discount_price: number;
        quantity: number;
        max_use_per_user: number;
        valid_from: string;
        valid_to: string;
        create_at: string;
        delete_at: string | null;
        shop_id: string;
    };
}

const EditShopVoucherPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '',
        minimum_require_price: '',
        max_discount_price: '',
        quantity: '',
        max_use_per_user: '',
        valid_from: '',
        valid_to: '',
        shop_id: '',
    });

    // Error state for validation
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Notification state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Query to get voucher details
    const { data, loading: queryLoading, error: queryError } = useQuery<ShopVoucherResponse>(GET_SHOP_VOUCHER_BY_ID, {
        variables: { id },
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.shopVoucher) {
                const voucher = data.shopVoucher;
                setFormData({
                    code: voucher.code,
                    discount_percent: (voucher.discount_percent * 100).toString(),
                    minimum_require_price: voucher.minimum_require_price.toString(),
                    max_discount_price: voucher.max_discount_price.toString(),
                    quantity: voucher.quantity.toString(),
                    max_use_per_user: voucher.max_use_per_user.toString(),
                    valid_from: moment(voucher.valid_from).format('YYYY-MM-DDTHH:mm'),
                    valid_to: moment(voucher.valid_to).format('YYYY-MM-DDTHH:mm'),
                    shop_id: voucher.shop_id,
                });
            }
        },
    });

    // Mutation to update voucher
    const [updateVoucher, { loading: mutationLoading }] = useMutation(UPDATE_SHOP_VOUCHER, {
        onCompleted: () => {
            setSnackbar({
                open: true,
                message: 'Cập nhật voucher thành công!',
                severity: 'success',
            });
            setTimeout(() => router.push('/seller/voucher'), 2000); // Redirect after 2s
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message: `Lỗi khi cập nhật voucher: ${error.message}`,
                severity: 'error',
            });
        },
    });

    // Handle input change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.code) newErrors.code = 'Mã voucher không được để trống';

        const discountPercent = parseFloat(formData.discount_percent);
        if (!formData.discount_percent || discountPercent <= 0 || discountPercent > 100) {
            newErrors.discount_percent = 'Phần trăm giảm giá phải lớn hơn 0 và tối đa 100';
        }

        if (!formData.minimum_require_price || parseInt(formData.minimum_require_price) < 0) {
            newErrors.minimum_require_price = 'Giá tối thiểu không được nhỏ hơn 0';
        }

        if (!formData.max_discount_price || parseInt(formData.max_discount_price) <= 0) {
            newErrors.max_discount_price = 'Giảm tối đa phải lớn hơn 0';
        }

        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }

        // if (!formData.max_use_per_user || parseInt(formData.max_use_per_user) <= 0) {
        //     newErrors.max_use_per_user = 'Số lần sử dụng tối đa phải lớn hơn 0';
        // }

        if (!formData.valid_from) newErrors.valid_from = 'Thời gian hiệu lực không được để trống';
        if (!formData.valid_to) newErrors.valid_to = 'Thời gian hết hạn không được để trống';

        // Validate valid_from <= valid_to
        if (formData.valid_from && formData.valid_to) {
            const validFrom = new Date(formData.valid_from);
            const validTo = new Date(formData.valid_to);
            if (validFrom > validTo) {
                newErrors.valid_to = 'Thời gian hết hạn phải sau hoặc bằng thời gian hiệu lực';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle form submission
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Convert data
        const updateShopVoucherInput = {
            id,
            code: formData.code,
            discount_percent: (parseFloat(formData.discount_percent) || 0) / 100, // Convert to 0-1 range
            minimum_require_price: parseInt(formData.minimum_require_price) || 0,
            max_discount_price: parseInt(formData.max_discount_price) || 0,
            quantity: parseInt(formData.quantity) || 0,
            max_use_per_user: parseInt(formData.max_use_per_user) || 0,
            valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : '',
            valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : '',
            shop_id: formData.shop_id,
        };

        // Execute mutation
        updateVoucher({ variables: { updateShopVoucherInput } });
    }, [formData, updateVoucher, validateForm, id]);

    // Handle snackbar close
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    }, [snackbar]);

    // Redirect if voucher is deleted
    useEffect(() => {
        if (data?.shopVoucher?.delete_at) {
            setSnackbar({
                open: true,
                message: 'Không thể chỉnh sửa voucher đã bị xóa',
                severity: 'error',
            });
            setTimeout(() => router.push('/seller/voucher'), 2000);
        }
    }, [data, router]);

    if (queryLoading) {
        return (
            <Box className="flex items-center justify-center h-screen">
                <CircularProgress />
                <Typography className="ml-3">Đang tải thông tin voucher...</Typography>
            </Box>
        );
    }

    if (queryError) {
        return (
            <Box className="p-6">
                <Alert severity="error" className="mb-4">
                    <Typography variant="h6">Đã xảy ra lỗi!</Typography>
                    <Typography>{queryError.message}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    if (!data?.shopVoucher) {
        return (
            <Box className="p-6">
                <Alert severity="warning" className="mb-4">
                    <Typography variant="h6">Không tìm thấy voucher</Typography>
                    <Typography>Không thể tìm thấy voucher với ID {id}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    // Prevent editing if voucher is deleted
    if (data.shopVoucher.delete_at) {
        return (
            <Box className="p-6">
                <Alert severity="warning" className="mb-4">
                    <Typography variant="h6">Voucher đã bị xóa</Typography>
                    <Typography>Không thể chỉnh sửa voucher đã bị xóa</Typography>
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    return (
        <div className="overflow-y-auto p-6">
            <Box className="flex justify-between items-center mb-6">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" className="font-bold">
                    Chỉnh sửa Voucher
                </Typography>
            </Box>

            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                <CardContent className="!p-6">
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mã Voucher"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    error={!!errors.code}
                                    helperText={errors.code}
                                />
                                <TextField
                                    fullWidth
                                    label="Phần trăm giảm giá (%)"
                                    name="discount_percent"
                                    type="number"
                                    value={formData.discount_percent}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    inputProps={{ min: 1, max: 100, step: 1 }}
                                    error={!!errors.discount_percent}
                                    helperText={errors.discount_percent}
                                />
                                <TextField
                                    fullWidth
                                    label="Giá tối thiểu (VNĐ)"
                                    name="minimum_require_price"
                                    type="number"
                                    value={formData.minimum_require_price}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    inputProps={{ min: 0 }}
                                    error={!!errors.minimum_require_price}
                                    helperText={errors.minimum_require_price}
                                />
                                <TextField
                                    fullWidth
                                    label="Giảm tối đa (VNĐ)"
                                    name="max_discount_price"
                                    type="number"
                                    value={formData.max_discount_price}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    inputProps={{ min: 1 }}
                                    error={!!errors.max_discount_price}
                                    helperText={errors.max_discount_price}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Số lượng"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    inputProps={{ min: 1 }}
                                    error={!!errors.quantity}
                                    helperText={errors.quantity}
                                />
                                {/* <TextField
                                    fullWidth
                                    label="Số lần sử dụng tối đa mỗi người"
                                    name="max_use_per_user"
                                    type="number"
                                    value={formData.max_use_per_user}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    inputProps={{ min: 1 }}
                                    error={!!errors.max_use_per_user}
                                    helperText={errors.max_use_per_user}
                                /> */}
                                <TextField
                                    fullWidth
                                    label="Hiệu lực từ"
                                    name="valid_from"
                                    type="datetime-local"
                                    value={formData.valid_from}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.valid_from}
                                    helperText={errors.valid_from}
                                />
                                <TextField
                                    fullWidth
                                    label="Hết hạn"
                                    name="valid_to"
                                    type="datetime-local"
                                    value={formData.valid_to}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="!mb-4"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.valid_to}
                                    helperText={errors.valid_to}
                                />
                            </Grid>
                            <Grid item xs={12} className="flex justify-center mt-4">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={mutationLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={mutationLoading}
                                >
                                    {mutationLoading ? 'Đang cập nhật...' : 'Cập nhật Voucher'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

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

export default EditShopVoucherPage; 