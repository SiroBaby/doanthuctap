'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '@/graphql/queries';
import {
    CREATE_PRODUCT,
    CREATE_PRODUCT_DETAIL,
    CREATE_PRODUCT_IMAGE,
    CREATE_PRODUCT_VARIATION,
} from '@/graphql/mutations';
import axios from 'axios';

// Import the new components
import ProductImageUploader from '../../../../../components/common/ProductImageUploader';
import ProductVariationForm from '../../../../../components/common/ProductVariationForm';

const AddProductPage = ({ params }: { params: { shopId: string } }) => {
    const router = useRouter();

    // Form state
    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState('');
    const [status, setStatus] = useState('active');
    const [categoryId, setCategoryId] = useState('');
    const [shopId, setShopId] = useState(`${params.shopId}`);
    const [description, setDescription] = useState('');
    const [specifications, setSpecifications] = useState('');
    const [variations, setVariations] = useState([
        { name: '', basePrice: '', discount: '', stock: '', status: 'active' },
    ]);
    const [images, setImages] = useState<File[]>([]);
    const [thumbnailStates, setThumbnailStates] = useState<boolean[]>([]);

    // Category state
    const [categoriesMap, setCategoriesMap] = useState<Map<number, any>>(new Map());
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Error state
    const [nameError, setNameError] = useState('');

    // Alert state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Loading state
    const [creating, setCreating] = useState(false);

    // Derived categories array from map for convenience
    const categories = useMemo(() => Array.from(categoriesMap.values()), [categoriesMap]);

    // Lazy query to load categories
    const [loadCategories, { loading: categoriesLoading, error: categoriesError }] = useLazyQuery(
        GET_CATEGORIES,
        {
            variables: { page: 1, limit: 10, search: '' },
            onCompleted: (data) => {
                setCategoriesMap(prevMap => {
                    const newMap = new Map(prevMap);
                    data.categorys.data.forEach((category: any) => {
                        newMap.set(category.category_id, category);
                    });
                    return newMap;
                });
                setHasMore(data.categorys.totalPage > page);
            },
        },
    );

    // Mutations
    const [createProduct] = useMutation(CREATE_PRODUCT);
    const [createProductDetail] = useMutation(CREATE_PRODUCT_DETAIL);
    const [createProductImage] = useMutation(CREATE_PRODUCT_IMAGE);
    const [createProductVariation] = useMutation(CREATE_PRODUCT_VARIATION);

    // Load initial categories
    useEffect(() => {
        loadCategories({ variables: { page: 1, limit: 10, search: '' } });
    }, [loadCategories]);

    // Handle scroll for category dropdown
    const handleScroll = useCallback(
        (event: React.UIEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            const bottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 1;
            if (bottom && hasMore && !categoriesLoading) {
                const nextPage = page + 1;
                setPage(nextPage);
                loadCategories({ variables: { page: nextPage, limit: 10, search: '' } });
            }
        },
        [hasMore, categoriesLoading, page, loadCategories],
    );

    // Form validation
    const validateForm = () => {
        let isValid = true;
        if (!productName.trim()) {
            setNameError('Tên sản phẩm không được để trống');
            isValid = false;
        } else {
            setNameError('');
        }
        return isValid;
    };

    // Handle snackbar message from child components
    const handleSnackbarMessage = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setCreating(true);

        try {
            // 1. Tạo Product Detail
            const productDetailResult = await createProductDetail({
                variables: {
                    createProductDetailInput: {
                        description: description || '',
                        specifications: specifications || '',
                    },
                },
            });
            const productDetailId = productDetailResult.data.createProductDetail.product_detail_id;

            // 2. Tạo Product
            const productResult = await createProduct({
                variables: {
                    createProductInput: {
                        product_name: productName,
                        brand: brand || '',
                        status,
                        category_id: categoryId ? parseInt(categoryId) : null,
                        product_detail_id: productDetailId,
                        shop_id: shopId || '',
                    },
                },
            });
            const productId = productResult.data.createProduct.product_id;

            // 3. Upload ảnh lên Cloudinary qua REST API
            let imageUrls = [];
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach((image) => formData.append('images', image));
                const uploadResponse = await axios.post('http://localhost:3301/api/upload', formData);
                imageUrls = uploadResponse.data.imageUrls;
            }

            // 4. Tạo Product Images
            if (imageUrls.length > 0) {
                for (let i = 0; i < imageUrls.length; i++) {
                    await createProductImage({
                        variables: {
                            createProductImageInput: {
                                product_id: productId,
                                image_url: imageUrls[i],
                                is_thumbnail: thumbnailStates[i] || false,
                            },
                        },
                    });
                }
            }

            // 5. Tạo Product Variations
            if (variations.length > 0) {
                for (const variation of variations) {
                    await createProductVariation({
                        variables: {
                            createProductVariationInput: {
                                product_variation_name: variation.name || '',
                                base_price: variation.basePrice ? parseFloat(variation.basePrice) : null,
                                // Convert percentage (0-100) to decimal (0-1)
                                percent_discount: variation.discount
                                    ? parseFloat(variation.discount) / 100
                                    : null,
                                stock_quantity: variation.stock ? parseInt(variation.stock) : null,
                                status: variation.status,
                                product_id: productId,
                            },
                        },
                    });
                }
            }

            setSnackbarMessage('Tạo sản phẩm thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setTimeout(() => router.push('/seller/products'), 1000);
        } catch (error: any) {
            setSnackbarMessage(`Lỗi khi tạo sản phẩm: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            console.error('Error submitting form:', error);
        } finally {
            setCreating(false);
        }
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => setSnackbarOpen(false);

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 dark:bg-dark-body">
            <div className="p-6">
                <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                    <CardContent>
                        <Typography variant="h4" className="!text-gray-700 dark:!text-gray-200 !font-bold mb-6">
                            Thêm sản phẩm mới
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box display="flex" flexDirection="column" gap={3}>
                                {/* Basic product information */}
                                <TextField
                                    label="Tên sản phẩm"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    error={!!nameError}
                                    helperText={nameError}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    placeholder="Nhập tên sản phẩm"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                />
                                <TextField
                                    label="Thương hiệu"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Nhập thương hiệu (nếu có)"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                />
                                <TextField
                                    select
                                    label="Trạng thái"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                                </TextField>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="category-label">Danh mục</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        label="Danh mục"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                onScroll: handleScroll,
                                                style: { maxHeight: 300 },
                                            },
                                        }}
                                        disabled={categoriesError && !categories.length}
                                        sx={{ backgroundColor: 'white', '.dark &': { backgroundColor: 'gray.300' } }}
                                    >
                                        {categoriesError && !categories.length && (
                                            <MenuItem value="">Lỗi tải danh mục</MenuItem>
                                        )}
                                        {categories.map((category) => (
                                            <MenuItem
                                                key={`cat-${category.category_id}`}
                                                value={category.category_id}
                                            >
                                                {category.category_name} (ID: {category.category_id})
                                            </MenuItem>
                                        ))}
                                        {categoriesLoading && <MenuItem disabled key="loading">Đang tải thêm...</MenuItem>}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Shop ID"
                                    value={shopId}
                                    onChange={(e) => setShopId(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Nhập ID cửa hàng"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                    disabled={true}
                                />
                                <TextField
                                    label="Mô tả"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder="Nhập mô tả sản phẩm"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                />
                                <TextField
                                    label="Thông số"
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder="Nhập thông số"
                                    InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                                />

                                {/* Product Variations Component */}
                                <ProductVariationForm
                                    variations={variations}
                                    onVariationsChange={setVariations}
                                    onSnackbarMessage={handleSnackbarMessage}
                                />

                                {/* Product Images Component */}
                                <ProductImageUploader
                                    images={images}
                                    thumbnailStates={thumbnailStates}
                                    onImagesChange={setImages}
                                    onThumbnailStatesChange={setThumbnailStates}
                                />

                                <Box display="flex" gap={2} justifyContent="flex-start" mt={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => router.push('/admin/products')}
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
                                            'Tạo sản phẩm'
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AddProductPage;