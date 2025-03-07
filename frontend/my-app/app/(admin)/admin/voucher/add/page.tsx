'use client'
import React, { useState, useCallback } from 'react';
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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { ADD_VOUCHER } from '@/graphql/mutations';
import moment from 'moment-timezone';

const AddVoucherPage = () => {
    const router = useRouter();

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
    });

    // Error state for validation
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Notification state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Mutation hook
    const [createVoucher, { loading }] = useMutation(ADD_VOUCHER, {
        onCompleted: () => {
            setSnackbarMessage('Thêm voucher thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setTimeout(() => router.push('/admin/voucher'), 2000); // Redirect after 2s
        },
        onError: (error) => {
            setSnackbarMessage(`Lỗi khi thêm voucher: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
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
        if (!formData.discount_percent || discountPercent < 10 || discountPercent > 100) {
            newErrors.discount_percent = 'Phần trăm giảm giá phải từ 10 đến 100';
        }

        if (!formData.minimum_require_price || parseInt(formData.minimum_require_price) < 0) {
            newErrors.minimum_require_price = 'Giá tối thiểu không được nhỏ hơn 0';
        }

        if (!formData.max_discount_price || parseInt(formData.max_discount_price) < 0) {
            newErrors.max_discount_price = 'Giảm tối đa không được nhỏ hơn 0';
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Số lượng không được nhỏ hơn 0';
        }

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
        const createVoucherInput = {
            code: formData.code,
            discount_percent: (parseFloat(formData.discount_percent) || 0) / 100, // Convert to 0-1 range
            minimum_require_price: parseInt(formData.minimum_require_price) || 0,
            max_discount_price: parseInt(formData.max_discount_price) || 0,
            quantity: parseInt(formData.quantity) || 0,
            max_use_per_user: parseInt(formData.max_use_per_user) || 0,
            valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : '',
            valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : '',
        };

        // Execute mutation
        createVoucher({ variables: { createVoucherInput } });
    }, [formData, createVoucher, validateForm]);

    // Handle snackbar close
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                <CardContent className="!p-6">
                    <Typography
                        variant="h5"
                        className="!mb-6 !font-bold !text-gray-700 dark:!text-gray-200"
                    >
                        Thêm Voucher Mới
                    </Typography>

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
                                    inputProps={{ min: 10, max: 100, step: 1 }} // Restrict input range
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
                                    inputProps={{ min: 0 }}
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
                                    inputProps={{ min: 0 }}
                                    error={!!errors.quantity}
                                    helperText={errors.quantity}
                                />
                                <TextField
                                    fullWidth
                                    label="Số lần sử dụng tối đa mỗi người"
                                    name="max_use_per_user"
                                    type="number"
                                    value={formData.max_use_per_user}
                                    onChange={handleChange}
                                    variant="outlined"
                                    className="!mb-4"
                                    error={!!errors.max_use_per_user}
                                    helperText={errors.max_use_per_user}
                                />
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
                            <Grid item xs={12}>
                                <div className="flex justify-end gap-4">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => router.push('/admin/voucher')}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Thêm Voucher'}
                                    </Button>
                                </div>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            {/* Notification */}
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

export default AddVoucherPage;