import React from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductVariation {
    name: string;
    basePrice: string;
    discount: string;
    stock: string;
    status: string;
}

interface ProductVariationFormProps {
    variations: ProductVariation[];
    onVariationsChange: (newVariations: ProductVariation[]) => void;
    onSnackbarMessage: (message: string, severity: 'success' | 'error') => void;
}

const ProductVariationForm: React.FC<ProductVariationFormProps> = ({
    variations,
    onVariationsChange,
    onSnackbarMessage,
}) => {
    // Handle add variation
    const handleAddVariation = () => {
        onVariationsChange([...variations, { name: '', basePrice: '', discount: '', stock: '', status: 'active' }]);
    };

    // Handle remove variation
    const handleRemoveVariation = (index: number) => {
        if (variations.length === 1) {
            onSnackbarMessage('Phải có ít nhất một biến thể!', 'error');
            return;
        }
        const updatedVariations = variations.filter((_, i) => i !== index);
        onVariationsChange(updatedVariations);
    };

    // Handle variation change with discount validation
    const handleVariationChange = (index: number, field: string, value: string) => {
        const newVariations = [...variations];

        // Add special handling for discount field
        if (field === 'discount') {
            // Parse the input value
            let numValue = parseFloat(value);

            // If it's a valid number, ensure it's between 0 and 100
            if (!isNaN(numValue)) {
                if (numValue < 0) numValue = 0;
                if (numValue > 100) numValue = 100;
                value = numValue.toString();
            }
        }

        newVariations[index] = { ...newVariations[index], [field]: value };
        onVariationsChange(newVariations);
    };

    return (
        <>
            <Typography variant="h6" className="!text-gray-700 dark:!text-gray-200">
                Biến thể sản phẩm
            </Typography>
            {variations.map((variation, index) => (
                <Box key={index} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        label="Tên biến thể"
                        value={variation.name}
                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                        variant="outlined"
                        placeholder="Nhập tên biến thể"
                        InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                    />
                    <TextField
                        label="Giá gốc"
                        value={variation.basePrice}
                        onChange={(e) => handleVariationChange(index, 'basePrice', e.target.value)}
                        variant="outlined"
                        type="number"
                        placeholder="Nhập giá gốc"
                        InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                    />
                    <TextField
                        label="Phần trăm giảm giá"
                        value={variation.discount}
                        onChange={(e) => handleVariationChange(index, 'discount', e.target.value)}
                        variant="outlined"
                        type="number"
                        title="Nhập % giảm giá (0-100)"
                        placeholder="Nhập % giảm giá (0-100)"
                        InputProps={{
                            className: 'bg-white dark:bg-gray-300',
                            inputProps: { min: 0, max: 100 }
                        }}
                    />
                    <TextField
                        label="Số lượng tồn kho"
                        value={variation.stock}
                        onChange={(e) => handleVariationChange(index, 'stock', e.target.value)}
                        variant="outlined"
                        type="number"
                        placeholder="Nhập số lượng"
                        InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                    />
                    <TextField
                        select
                        label="Trạng thái"
                        value={variation.status}
                        onChange={(e) => handleVariationChange(index, 'status', e.target.value)}
                        variant="outlined"
                        InputProps={{ className: 'bg-white dark:bg-gray-300' }}
                    >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    </TextField>
                    <IconButton
                        color="error"
                        onClick={() => handleRemoveVariation(index)}
                        title="Xóa biến thể"
                        disabled={variations.length === 1}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddVariation}
                className="!mt-2"
            >
                Thêm biến thể
            </Button>
        </>
    );
};

export default ProductVariationForm;
