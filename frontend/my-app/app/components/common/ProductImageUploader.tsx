import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductImageUploaderProps {
    images: File[];
    thumbnailStates: boolean[];
    onImagesChange: (newImages: File[]) => void;
    onThumbnailStatesChange: (newThumbnailStates: boolean[]) => void;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
    images,
    thumbnailStates,
    onImagesChange,
    onThumbnailStatesChange,
}) => {
    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length > 0) {
            const updatedImages = [...images, ...newFiles];
            onImagesChange(updatedImages);
            onThumbnailStatesChange(updatedImages.map((_, i) => i === (images.length > 0 ? 0 : 0)));
            console.log('Selected images:', updatedImages); // Debug
        }
    };

    // Handle remove image
    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        const updatedThumbnailStates = thumbnailStates.filter((_, i) => i !== index);
        if (thumbnailStates[index] && updatedThumbnailStates.length > 0) {
            updatedThumbnailStates[0] = true;
        }
        onImagesChange(updatedImages);
        onThumbnailStatesChange(updatedThumbnailStates);
    };

    // Handle thumbnail selection
    const handleThumbnailChange = (index: number) => {
        const newThumbnailStates = thumbnailStates.map((_, i) => i === index);
        onThumbnailStatesChange(newThumbnailStates);
    };

    return (
        <>
            <Typography variant="h6" className="!text-gray-700 dark:!text-gray-200">
                Hình ảnh sản phẩm
            </Typography>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            {images.length > 0 && (
                <Box>
                    <Typography variant="subtitle1">Danh sách hình ảnh đã chọn:</Typography>
                    <Typography variant='caption' sx={{ fontStyle: 'italic' }}>*Chọn 1 ảnh làm banner*</Typography>
                    {images.map((image, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={thumbnailStates[index]}
                                        onChange={() => handleThumbnailChange(index)}
                                    />
                                }
                                label={image.name}
                            />
                            <Typography variant="body2" color="textSecondary">
                                ({(image.size / 1024).toFixed(2)} KB)
                            </Typography>
                            <IconButton
                                color="error"
                                onClick={() => handleRemoveImage(index)}
                                title="Xóa hình ảnh"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </>
    );
};

export default ProductImageUploader;
