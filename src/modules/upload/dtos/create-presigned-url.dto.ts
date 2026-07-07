export class CreatePresignedUploadDto {
  folder: string;
  fileType: string;
  fileHash: string;
  size: number;
}