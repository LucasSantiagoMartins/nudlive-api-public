import { Module } from '@nestjs/common';
import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { UploadValidator } from './validators/upload.validator';
import { r2ClientProvider } from './providers/r2-client.provider';
import { Upload } from './entities/upload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Upload]),
  ],
  providers: [UploadService, UploadValidator, r2ClientProvider],
  exports: [UploadService, r2ClientProvider],
  controllers: [UploadController],
})
export class UploadModule { }