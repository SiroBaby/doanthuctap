import { Module } from '@nestjs/common';
import { UploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [UploadController],
    providers: [FileUploadService],
})
export class UploadModule { }