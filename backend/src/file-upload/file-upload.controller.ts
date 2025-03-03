import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { memoryStorage } from 'multer';

@Controller('api')
export class UploadController {
    constructor(private readonly uploadService: FileUploadService) { }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() })) // Giới hạn 10 file
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadResponseDto> {
        const imageUrls = await this.uploadService.uploadFiles(files);
        return { imageUrls };
    }
}