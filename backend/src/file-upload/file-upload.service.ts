import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileUploadService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: 'dzjcbikrl',
            api_key: '191154734859175',
            api_secret: this.configService.get<string>('CLOUDINARY_SECRET'),
        });
    }

    async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
        const uploadPromises = files.map(async (file) => {
            try {
                const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    {
                        folder: 'shop',
                        resource_type: 'auto',
                        public_id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Tạo public_id độc nhất
                    }
                );
                return uploadResult.secure_url;
            } catch (error) {
                throw new Error(`Upload failed: ${error.message}`);
            }
        });

        return Promise.all(uploadPromises);
    }
}