'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID, GET_CATEGORIES } from '@/graphql/queries';
import { 
  UPDATE_PRODUCT, 
  UPDATE_PRODUCT_DETAIL, 
  UPDATE_PRODUCT_IMAGE, 
  UPDATE_PRODUCT_VARIATION,
  CREATE_PRODUCT_IMAGE,
  DELETE_PRODUCT_IMAGE,
  CREATE_PRODUCT_VARIATION
} from '@/graphql/mutations';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import axios from 'axios';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_thumbnail: boolean;
}

interface ProductVariation {
  product_variation_id: number;
  product_variation_name: string;
  base_price: number;
  percent_discount: number;
  stock_quantity: number;
  status: string;
}

interface CategoryResponse {
  category_id: number;
  category_name: string;
}

interface FormData {
  product_name: string;
  brand: string;
  status: string;
  category_id: number;
  category_name: string;
  product_detail: {
    description: string;
    specifications: string;
  };
  product_images: Array<{
    image_id?: number;
    image_url: string;
    is_thumbnail: boolean;
    isNew?: boolean;
    isDeleted?: boolean;
  }>;
  product_variations: Array<{
    product_variation_id?: number;
    product_variation_name: string;
    base_price: number;
    percent_discount: number;
    stock_quantity: number;
    status: string;
    isNew?: boolean;
    isDeleted?: boolean;
  }>;
}

interface ImageFieldType {
  id: string;
  image_id?: number;
  image_url: string;
  is_thumbnail: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

const EditProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.productId as string);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<number, CategoryResponse>>(new Map());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue,
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      product_name: '',
      brand: '',
      status: '',
      category_id: 0,
      category_name: '',
      product_detail: {
        description: '',
        specifications: '',
      },
      product_images: [],
      product_variations: [],
    },
  });

  const categories = useMemo(() => Array.from(categoriesMap.values()), [categoriesMap]);

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation
  } = useFieldArray({
    control,
    name: 'product_variations',
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage
  } = useFieldArray({
    control,
    name: 'product_images',
  });

  const [loadCategories, { loading: categoriesLoading }] = useLazyQuery(GET_CATEGORIES, {
    variables: { page: 1, limit: 10, search: '' },
    onCompleted: (data) => {
      console.log('Categories data:', data);
      setCategoriesMap(prevMap => {
        const newMap = new Map(prevMap);
        data.categorys.data.forEach((category: CategoryResponse) => {
          newMap.set(category.category_id, category);
        });
        return newMap;
      });
      setHasMore(data.categorys.totalPage > page);
    },
  });

  const handleCategoryScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const bottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 1;
      if (bottom && hasMore && !categoriesLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadCategories({ variables: { page: nextPage, limit: 10, search: '' } });
      }
    },
    [hasMore, categoriesLoading, page, loadCategories]
  );

  useEffect(() => {
    loadCategories({ variables: { page: 1, limit: 10, search: '' } });
  }, [loadCategories]);

  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const product = data.product;
      
      const thumbnailIndex = product.product_images.findIndex((img: ProductImage) => img.is_thumbnail);
      if (thumbnailIndex >= 0) {
        setSelectedThumbnail(thumbnailIndex);
      }

      console.log('Product data:', product);

      reset({
        product_name: product.product_name,
        brand: product.brand,
        status: product.status,
        category_id: product.category.category_id,
        category_name: product.category.category_name,
        product_detail: {
          description: product.product_detail.description,
          specifications: product.product_detail.specifications,
        },
        product_images: product.product_images.map((img: ProductImage) => ({
          image_id: img.image_id,
          image_url: img.image_url,
          is_thumbnail: img.is_thumbnail,
        })),
        product_variations: product.product_variations.map((variation: ProductVariation) => ({
          product_variation_id: variation.product_variation_id,
          product_variation_name: variation.product_variation_name,
          base_price: variation.base_price,
          percent_discount: variation.percent_discount * 100,
          stock_quantity: variation.stock_quantity,
          status: variation.status,
        })),
      });
    },
  });

  // Đồng bộ category sau khi có data và categories
  useEffect(() => {
    if (data?.product && categories.length > 0) {
      const productCategoryId = data.product.category.category_id;
      const productCategoryName = data.product.category.category_name;
      
      // Tìm category trong danh sách categories đã tải về bằng ID chứ không phải tên
      const selectedCategory = categories.find(
        (cat) => cat.category_id === productCategoryId
      );

      if (selectedCategory) {
        // Nếu tìm thấy category trong danh sách đã tải về, sử dụng category_id của nó
        console.log('Tìm thấy category trong danh sách:', selectedCategory);
        setValue('category_name', selectedCategory.category_name);
        setValue('category_id', selectedCategory.category_id);
      } else {
        // Nếu không tìm thấy, thêm category từ API vào danh sách
        console.log('Không tìm thấy category trong danh sách, sẽ sử dụng category từ sản phẩm');
        setValue('category_id', productCategoryId);
        setValue('category_name', productCategoryName);
        
        // Thêm category này vào categoriesMap để có thể hiển thị và chọn
        setCategoriesMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(productCategoryId, {
            category_id: productCategoryId,
            category_name: productCategoryName
          });
          return newMap;
        });
      }
    }
  }, [data, categories, setValue]);

  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [updateProductDetail] = useMutation(UPDATE_PRODUCT_DETAIL);
  const [updateProductImage] = useMutation(UPDATE_PRODUCT_IMAGE);
  const [updateProductVariation] = useMutation(UPDATE_PRODUCT_VARIATION);
  const [createProductImage] = useMutation(CREATE_PRODUCT_IMAGE);
  const [deleteProductImage] = useMutation(DELETE_PRODUCT_IMAGE);
  const [createProductVariation] = useMutation(CREATE_PRODUCT_VARIATION);

  useEffect(() => {
    if (data?.product) {
      console.log('Form values:', {
        currentCategoryId: data.product.category.category_id,
        currentCategoryName: data.product.category.category_name,
        availableCategories: categories.map(c => ({ id: c.category_id, name: c.category_name })),
        currentStatus: data.product.status
      });
    }
  }, [data, categories]);

  const onSubmit = async (formData: FormData) => {
    try {
      // Log category_id được gửi lên
      console.log('Category ID được gửi lên:', formData.category_id);
      console.log('Category Name được chọn:', formData.category_name);
      
      // Kiểm tra category_id
      if (!formData.category_id) {
        const foundCategory = categories.find(cat => cat.category_name === formData.category_name);
        if (foundCategory) {
          formData.category_id = foundCategory.category_id;
        } else if (data?.product?.category?.category_id) {
          formData.category_id = data.product.category.category_id;
        } else {
          throw new Error('Không thể xác định category_id hợp lệ');
        }
        console.log('Category ID sau khi xử lý:', formData.category_id);
      }
      
      setIsSubmitting(true);
      const product = data.product;

      await updateProduct({
        variables: {
          shopid: product.shop.shop_id,
          updateProductInput: {
            product_id: productId,
            product_name: formData.product_name,
            brand: formData.brand,
            status: formData.status,
            category_id: formData.category_id,
          },
        },
      });

      await updateProductDetail({
        variables: {
          updateProductDetailInput: {
            product_detail_id: product.product_detail.product_detail_id,
            description: formData.product_detail.description,
            specifications: formData.product_detail.specifications,
          },
        },
      });

      if (deletedImageIds.length > 0) {
        for (const imageId of deletedImageIds) {
          await deleteProductImage({
            variables: { id: imageId },
          });
        }
      }

      // Lọc các hình ảnh hiện có không bị xóa
      const existingImages = formData.product_images.filter(img => img.image_id && !img.isDeleted);
      for (let i = 0; i < existingImages.length; i++) {
        const img = existingImages[i];
        if (img.image_id) {
          await updateProductImage({
            variables: {
              updateProductImageInput: {
                image_id: img.image_id,
                image_url: img.image_url,
                is_thumbnail: i === selectedThumbnail,
              },
            },
          });
        }
      }

      // Kiểm tra và loại bỏ URL trùng lặp trước khi tạo ảnh mới
      const newUrlImages = formData.product_images.filter(img => !img.image_id && !img.isDeleted);
      
      // Mảng lưu trữ các URL đã thêm để kiểm tra trùng lặp
      const addedImageUrls = new Set<string>();
      
      // Trước tiên, thêm các URL của ảnh hiện có vào mảng để kiểm tra
      existingImages.forEach(img => addedImageUrls.add(img.image_url));
      
      // Xử lý các ảnh URL mới, bỏ qua URL trùng lặp
      for (let i = 0; i < newUrlImages.length; i++) {
        const img = newUrlImages[i];
        
        // Kiểm tra xem URL đã tồn tại chưa
        if (!addedImageUrls.has(img.image_url)) {
          // Thêm URL vào danh sách đã xử lý
          addedImageUrls.add(img.image_url);
          
          await createProductImage({
            variables: {
              createProductImageInput: {
                product_id: productId,
                image_url: img.image_url,
                is_thumbnail: (existingImages.length + i) === selectedThumbnail,
              },
            },
          });
        } else {
          console.log(`Bỏ qua URL trùng lặp: ${img.image_url}`);
        }
      }

      // Xử lý các ảnh tải lên
      if (uploadedImages.length > 0) {
        const formData = new FormData();
        uploadedImages.forEach((image) => formData.append('images', image));
        const uploadResponse = await axios.post('http://localhost:3301/api/upload', formData);
        const imageUrls = uploadResponse.data.imageUrls;

        for (let i = 0; i < imageUrls.length; i++) {
          const imageUrl = imageUrls[i];
          
          // Kiểm tra xem URL đã tồn tại chưa
          if (!addedImageUrls.has(imageUrl)) {
            // Thêm URL vào danh sách đã xử lý
            addedImageUrls.add(imageUrl);
            
            await createProductImage({
              variables: {
                createProductImageInput: {
                  product_id: productId,
                  image_url: imageUrl,
                  is_thumbnail: (existingImages.length + newUrlImages.length + i) === selectedThumbnail,
                },
              },
            });
          } else {
            console.log(`Bỏ qua URL tải lên trùng lặp: ${imageUrl}`);
          }
        }
      }

      // Cập nhật phiên bản sản phẩm
      // 1. Phiên bản hiện có
      const existingVariations = formData.product_variations.filter(variation => variation.product_variation_id);
      for (const variation of existingVariations) {
        if (variation.product_variation_id) {
          await updateProductVariation({
            variables: {
              updateProductVariationInput: {
                product_variation_id: variation.product_variation_id,
                product_variation_name: variation.product_variation_name,
                base_price: variation.base_price,
                percent_discount: variation.percent_discount / 100,
                stock_quantity: variation.stock_quantity,
                status: variation.status,
              },
            },
          });
        }
      }

      // 2. Phiên bản mới
      const newVariations = formData.product_variations.filter(variation => !variation.product_variation_id && !variation.isDeleted);
      console.log('Các phiên bản mới cần tạo:', newVariations);
      
      if (newVariations.length > 0) {
        for (const variation of newVariations) {
          try {
            // Tạo đối tượng input đúng định dạng
            const variationInput = {
              product_variation_name: variation.product_variation_name,
              base_price: Number(variation.base_price),
              percent_discount: Number(variation.percent_discount) / 100,
              stock_quantity: Number(variation.stock_quantity),
              status: variation.status,
              product_id: productId,
            };
            
            console.log('Gửi dữ liệu tạo phiên bản mới:', variationInput);
            
            const result = await createProductVariation({
              variables: {
                createProductVariationInput: variationInput,
              },
            });
            
            console.log('Đã tạo phiên bản mới:', result.data);
          } catch (variationError) {
            console.error('Lỗi khi tạo phiên bản sản phẩm:', variationError);
            // Hiển thị lỗi nhưng không dừng quá trình
            setSnackbar({
              open: true,
              message: `Lỗi khi tạo phiên bản "${variation.product_variation_name}": ${variationError}`,
              severity: 'error',
            });
          }
        }
      }

      setSnackbar({
        open: true,
        message: 'Cập nhật sản phẩm thành công!',
        severity: 'success',
      });

      setTimeout(() => {
        window.location.href = `/seller/product/detail/${productId}`;
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi cập nhật sản phẩm!',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      // Kiểm tra xem URL này đã tồn tại trong danh sách hình ảnh chưa
      const isDuplicate = imageFields.some(
        (field) => (field as unknown as ImageFieldType).image_url === newImageUrl.trim()
      );

      if (isDuplicate) {
        setSnackbar({
          open: true,
          message: 'URL hình ảnh này đã tồn tại trong danh sách!',
          severity: 'error',
        });
        return;
      }

      const isFirstImage = imageFields.length === 0 && uploadedImages.length === 0;
      appendImage({
        image_url: newImageUrl,
        is_thumbnail: isFirstImage,
        isNew: true,
      });
      setNewImageUrl('');
      if (isFirstImage) setSelectedThumbnail(0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetThumbnail = (index: number) => {
    setSelectedThumbnail(index);
  };

  const handleRemoveImage = (index: number) => {
    const image = imageFields[index] as unknown as ImageFieldType;
    if (image.image_id) {
      setDeletedImageIds(prev => [...prev, image.image_id!]);
    }
    if (selectedThumbnail === index) {
      setSelectedThumbnail(null);
    } else if (selectedThumbnail !== null && selectedThumbnail > index) {
      setSelectedThumbnail(selectedThumbnail - 1);
    }
    removeImage(index);
  };

  const handleAddVariation = () => {
    appendVariation({
      product_variation_name: '',
      base_price: 0,
      percent_discount: 0,
      stock_quantity: 0,
      status: 'active',
      isNew: true,
    });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen bg-gray-100">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.product) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
        <Typography variant="h6" color="error" sx={{ mt: 2 }}>
          Không thể tải thông tin sản phẩm
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-6">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1" className="font-bold">
          Chỉnh sửa sản phẩm
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" className="font-bold mb-4">
                  Thông tin cơ bản
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="product_name"
                      control={control}
                      rules={{ required: 'Tên sản phẩm là bắt buộc' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tên sản phẩm"
                          fullWidth
                          error={!!errors.product_name}
                          helperText={errors.product_name?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="brand"
                      control={control}
                      rules={{ required: 'Thương hiệu là bắt buộc' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Thương hiệu"
                          fullWidth
                          error={!!errors.brand}
                          helperText={errors.brand?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="category_id"
                      control={control}
                      rules={{ required: 'Danh mục là bắt buộc' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.category_id}>
                          <InputLabel id="category-select-label">Danh mục</InputLabel>
                          <Select
                            {...field}
                            labelId="category-select-label"
                            label="Danh mục"
                            value={field.value || ''}
                            onChange={(e) => {
                              const selectedCategoryId = e.target.value as number;
                              console.log('Category ID được chọn:', selectedCategoryId);
                              
                              field.onChange(selectedCategoryId);
                              
                              // Cập nhật category_name dựa trên ID đã chọn
                              const selectedCategory = categoriesMap.get(selectedCategoryId);
                              if (selectedCategory) {
                                setValue('category_name', selectedCategory.category_name);
                              }
                            }}
                            renderValue={(selectedId) => {
                              const category = categoriesMap.get(Number(selectedId));
                              return category ? `${category.category_name} (ID: ${category.category_id})` : '';
                            }}
                            MenuProps={{
                              PaperProps: {
                                onScroll: handleCategoryScroll,
                                style: { maxHeight: 300 }
                              }
                            }}
                          >
                            {categories.map((category: CategoryResponse) => (
                              <MenuItem key={category.category_id} value={category.category_id}>
                                {category.category_name} (ID: {category.category_id})
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.category_id && (
                            <Typography color="error" variant="caption">
                              {errors.category_id.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="status"
                      control={control}
                      rules={{ required: 'Trạng thái là bắt buộc' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.status}>
                          <InputLabel id="status-select-label">Trạng thái</InputLabel>
                          <Select
                            {...field}
                            labelId="status-select-label"
                            label="Trạng thái"
                            value={field.value || ''}
                          >
                            <MenuItem value="active">Đang bán</MenuItem>
                            <MenuItem value="inactive">Ngừng bán</MenuItem>
                            <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                          </Select>
                          {errors.status && (
                            <Typography color="error" variant="caption">
                              {errors.status.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" className="font-bold mb-4">
                  Mô tả và thông số kỹ thuật
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="product_detail.description"
                      control={control}
                      rules={{ required: 'Mô tả sản phẩm là bắt buộc' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Mô tả sản phẩm"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.product_detail?.description}
                          helperText={errors.product_detail?.description?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="product_detail.specifications"
                      control={control}
                      rules={{ required: 'Thông số kỹ thuật là bắt buộc' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Thông số kỹ thuật"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.product_detail?.specifications}
                          helperText={errors.product_detail?.specifications?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" className="font-bold mb-4">
                  Hình ảnh sản phẩm
                </Typography>
                <Box className="mb-4">
                  <Typography variant="subtitle1" className="mb-2">Tải lên hình ảnh mới:</Typography>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="mb-4" 
                  />
                  {uploadedImages.length > 0 && (
                    <Box className="mt-4 mb-4">
                      <Typography variant="subtitle2" className="mb-2">Hình ảnh đã chọn để tải lên:</Typography>
                      <Grid container spacing={2}>
                        {uploadedImages.map((file, index) => (
                          <Grid item xs={6} sm={4} md={3} key={`upload-${index}`}>
                            <Card>
                              <Box className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Upload preview ${index + 1}`}
                                  className="w-full h-40 object-cover"
                                />
                              </Box>
                              <CardContent className="p-2">
                                <Box className="flex justify-between items-center">
                                  <Typography variant="caption" noWrap>
                                    {file.name}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveUploadedImage(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  <Divider className="my-4" />
                  <Typography variant="subtitle1" className="mb-2">Hoặc thêm bằng URL:</Typography>
                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddImage}
                    startIcon={<AddIcon />}
                  >
                    Thêm hình ảnh
                  </Button>
                </Box>
                <Divider className="my-4" />
                <Typography variant="subtitle1" className="mb-2">Hình ảnh hiện tại:</Typography>
                <Grid container spacing={2}>
                  {imageFields.map((field, index) => {
                    const imageField = field as unknown as ImageFieldType;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={field.id}>
                        <Card>
                          <Box className="relative">
                            <img
                              src={imageField.image_url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-40 object-cover"
                            />
                            {selectedThumbnail === index && (
                              <Chip
                                label="Ảnh đại diện"
                                color="primary"
                                size="small"
                                className="absolute top-2 right-2"
                              />
                            )}
                          </Box>
                          <CardContent className="p-2">
                            <Box className="flex justify-between">
                              <Button
                                size="small"
                                onClick={() => handleSetThumbnail(index)}
                                disabled={selectedThumbnail === index}
                              >
                                Đặt làm ảnh đại diện
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6" component="h2" className="font-bold">
                    Phiên bản sản phẩm
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleAddVariation}
                    startIcon={<AddIcon />}
                  >
                    Thêm phiên bản
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên phiên bản</TableCell>
                        <TableCell>Giá gốc</TableCell>
                        <TableCell>% Giảm giá</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {variationFields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller
                              name={`product_variations.${index}.product_variation_name`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <TextField {...field} fullWidth size="small" />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`product_variations.${index}.base_price`}
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size="small"
                                  type="number"
                                  inputProps={{ min: 0 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`product_variations.${index}.percent_discount`}
                              control={control}
                              rules={{ required: true, min: 0, max: 100 }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size="small"
                                  type="number"
                                  inputProps={{ min: 0, max: 100 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`product_variations.${index}.stock_quantity`}
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size="small"
                                  type="number"
                                  inputProps={{ min: 0 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`product_variations.${index}.status`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <Select {...field} fullWidth size="small">
                                  <MenuItem value="active">Đang bán</MenuItem>
                                  <MenuItem value="inactive">Ngừng bán</MenuItem>
                                  <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="error" 
                              onClick={() => removeVariation(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box className="flex justify-end mt-4">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" className="mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProductPage;