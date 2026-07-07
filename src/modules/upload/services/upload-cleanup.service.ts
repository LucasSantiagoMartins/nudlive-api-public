// // src/modules/upload/services/upload-cleanup.service.ts

// import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { UploadService } from './upload.service';
// import { UploadStatus } from '../enums/upload-status.enum';

// @Injectable()
// export class UploadCleanupService {
//     private readonly logger = new Logger(UploadCleanupService.name);

//     constructor(private readonly uploadService: UploadService) {}

//     @Cron('0 * * * *')
//     async handleCleanup() {
//         const expired = await this.uploadService.findExpiredTemporaryUploads();

//         for (const upload of expired) {
//             try {
//                 await this.uploadService.deleteFileFromUrl(upload.url);

//                 upload.status = UploadStatus.DELETED;
//                 upload.deletedAt = new Date();

//                 this.logger.log(`Deleted expired upload: ${upload.key}`);
//             } catch (err) {
//                 this.logger.error(`Failed deleting upload ${upload.key}`, err);
//             }
//         }
//     }
// }