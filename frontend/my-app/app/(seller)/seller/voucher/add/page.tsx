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
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_SHOP_VOUCHER } from '@/graphql/mutations';
import { GET_SHOP_ID_BY_USER_ID } from '@/graphql/queries';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '@clerk/nextjs';
import moment from 'moment-timezone';

interface ShopIdResponse {
    getShopIdByUserId: {
        shop_id: string;
    };
}

const AddShopVoucherPage = () => {
    const router = useRouter();
    const { userId } = useAuth();
    const [shopId, setShopId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '',
        minimum_require_price: '',
        max_discount_price: '',
        quantity: '',
        max_use_per_user: '1',
        valid_from: moment().format('YYYY-MM-DDTHH:mm'), // Default to current time
        valid_to: moment().add(7, 'days').format('YYYY-MM-DDTHH:mm'), // Default to 7 days from now
    });

    // Error state for validation
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Notification state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // Thêm state để theo dõi khi nào mutation hoàn thành
    const [mutationCompleted, setMutationCompleted] = useState(false);

    // Thêm state để theo dõi nếu thêm voucher thành công
    const [voucherAdded, setVoucherAdded] = useState(false);

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

    // Mutation hook
    const [createVoucher, { loading, data: mutationData }] = useMutation(ADD_SHOP_VOUCHER, {
        onCompleted: (data) => {
            console.log("Voucher added successfully, redirecting...", data);
            setSnackbar({
                open: true,
                message: 'Thêm voucher thành công!',
                severity: 'success',
            });
            
            // Đánh dấu mutation đã hoàn tất và voucher đã được thêm
            setMutationCompleted(true);
            setVoucherAdded(true);
            
            // Thử nhiều cách chuyển hướng khác nhau để đảm bảo hoạt động
            try {
                window.location.href = '/seller/voucher';
            } catch (error) {
                console.error("Error during redirect:", error);
                // Nếu cách trên thất bại, thử cách khác
                setTimeout(() => {
                    window.location.replace('/seller/voucher');
                }, 500);
            }
        },
        onError: (error) => {
            console.error("Error adding voucher:", error);
            setSnackbar({
                open: true,
                message: `Lỗi khi thêm voucher: ${error.message}`,
                severity: 'error',
            });
        },
    });

    // Effect để theo dõi khi mutation hoàn tất
    useEffect(() => {
        if (mutationCompleted && mutationData) {
            console.log("Using useEffect to redirect");
            // Thêm một cách chuyển hướng khác dùng useEffect
            const redirectTimer = setTimeout(() => {
                router.push('/seller/voucher');
            }, 800);
            
            return () => clearTimeout(redirectTimer);
        }
    }, [mutationCompleted, mutationData, router]);

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

        if (!formData.max_use_per_user || parseInt(formData.max_use_per_user) <= 0) {
            newErrors.max_use_per_user = 'Số lần sử dụng tối đa phải lớn hơn 0';
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
        console.log("Form submitted, validating...");
        
        if (!validateForm()) {
            console.log("Form validation failed", errors);
            return;
        }
        
        console.log("ShopId:", shopId);
        if (!shopId) {
            console.error("Shop ID missing");
            setSnackbar({
                open: true,
                message: 'Không thể xác định shop ID. Vui lòng thử lại sau.',
                severity: 'error',
            });
            return;
        }

        // Convert data
        const createShopVoucherInput = {
            code: formData.code,
            discount_percent: (parseFloat(formData.discount_percent) || 0) / 100, // Convert to 0-1 range
            minimum_require_price: parseInt(formData.minimum_require_price) || 0,
            max_discount_price: parseInt(formData.max_discount_price) || 0,
            quantity: parseInt(formData.quantity) || 0,
            max_use_per_user: parseInt(formData.max_use_per_user) || 0,
            valid_from: formData.valid_from ? 
                // Tạo Date object và để nó giữ nguyên định dạng local time 
                // Khi chuyển sang ISO sẽ điều chỉnh sang UTC tự động
                new Date(formData.valid_from).toISOString() : '',
            valid_to: formData.valid_to ? 
                // Tạo Date object và để nó giữ nguyên định dạng local time
                // Khi chuyển sang ISO sẽ điều chỉnh sang UTC tự động
                new Date(formData.valid_to).toISOString() : '',
            shop_id: shopId,
        };

        // Hiển thị thông báo đang xử lý
        setSnackbar({
            open: true,
            message: 'Đang thêm voucher, vui lòng đợi...',
            severity: 'info',
        });

        console.log("Sending mutation with data:", { createShopVoucherInput });
        createVoucher({ 
            variables: { createShopVoucherInput },
            onCompleted(data) {
                console.log("Mutation successful directly from handleSubmit:", data);
                // Đặt một flag trong localStorage để đánh dấu chuyển hướng cần xảy ra
                localStorage.setItem('voucher_added_redirect', '1');
                
                // Thử cả phương pháp chuyển hướng trực tiếp từ đây
                setTimeout(() => {
                    window.location.href = '/seller/voucher';
                }, 1000);
            },
            onError(error) {
                console.error("Mutation error:", error);
            }
        });
    }, [formData, createVoucher, validateForm, shopId, errors]);

    // Handle snackbar close
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    }, [snackbar]);

    if (shopIdLoading) {
        return (
            <Box className="flex items-center justify-center h-screen">
                <CircularProgress />
                <Typography className="ml-3">Đang tải thông tin cửa hàng...</Typography>
            </Box>
        );
    }

    return (
        <div className="overflow-y-auto p-6">
            {voucherAdded && (
                <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex justify-between items-center">
                    <div>
                        <strong className="font-bold">Thành công!</strong>
                        <span className="block sm:inline"> Voucher đã được thêm thành công.</span>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.href = '/seller/voucher'}
                    >
                        Quay về trang voucher
                    </Button>
                </div>
            )}
            
            <Box className="flex justify-between items-center mb-6">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" className="font-bold">
                    Thêm Voucher Mới
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
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang thêm...' : 'Thêm Voucher'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="secondary"
                                    size="large"
                                    className="ml-4"
                                    onClick={() => {
                                        // Reset form về giá trị mặc định
                                        setFormData({
                                            code: '',
                                            discount_percent: '',
                                            minimum_require_price: '',
                                            max_discount_price: '',
                                            quantity: '',
                                            max_use_per_user: '1',
                                            valid_from: moment().format('YYYY-MM-DDTHH:mm'),
                                            valid_to: moment().add(7, 'days').format('YYYY-MM-DDTHH:mm'),
                                        });
                                        setErrors({});
                                    }}
                                >
                                    Đặt lại
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    
                    <Box className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
                        <Typography variant="subtitle1" className="font-semibold mb-2">
                            Hướng dẫn tạo voucher:
                        </Typography>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Mã voucher không được trùng với mã đã tồn tại</li>
                            <li>Phần trăm giảm giá là số từ 1-100%</li>
                            <li>Giá tối thiểu là giá trị đơn hàng tối thiểu để áp dụng voucher</li>
                            <li>Giảm tối đa là số tiền giảm tối đa mà voucher này có thể giảm</li>
                            <li>Thời gian hiệu lực và hết hạn quyết định khoảng thời gian voucher có thể được sử dụng</li>
                            <li>Sau khi tạo voucher, bạn sẽ được chuyển về trang quản lý voucher</li>
                        </ul>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    action={
                        mutationCompleted ? (
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => window.location.href = '/seller/voucher'}
                            >
                                Đi đến trang voucher
                            </Button>
                        ) : null
                    }
                >
                    {snackbar.message}
                    {mutationCompleted && (
                        <div className="mt-2">
                            Nếu không được chuyển hướng tự động, hãy click vào nút bên phải.
                        </div>
                    )}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AddShopVoucherPage; 