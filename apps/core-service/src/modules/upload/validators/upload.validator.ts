import { BadRequestException } from '@nestjs/common';

export class UploadValidator {
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/webm',
    ];

    private readonly allowedFolders = [
        'profiles/pictures',
        'profiles/banners',
        'lives/thumbnails',
        'messages/attachments',
        'payments/receipts',
    ];

    private readonly publicFolders = [
        'profiles/pictures',
        'profiles/banners',
        'lives/thumbnails',
        'chats/emojis',
    ];

    /**
     * 100 MB
     */
    private readonly maxFileSize = 100 * 1024 * 1024;

    validateUploadData(
        folder: string,
        fileType: string,
        size: number,
    ): void {
        if (!folder || typeof folder !== 'string') {
            throw new BadRequestException(
                'Por favor, informe a pasta corretamente',
            );
        }

        if (!this.allowedFolders.includes(folder)) {
            throw new BadRequestException(
                'Pasta de upload não permitida',
            );
        }

        if (!fileType || typeof fileType !== 'string') {
            throw new BadRequestException(
                'Por favor, informe o tipo de ficheiro',
            );
        }

        if (!this.allowedMimeTypes.includes(fileType)) {
            throw new BadRequestException(
                'Tipo de ficheiro não suportado',
            );
        }

        if (
            size === undefined ||
            size === null ||
            typeof size !== 'number' ||
            Number.isNaN(size) ||
            size <= 0
        ) {
            throw new BadRequestException(
                'Por favor, informe um tamanho de ficheiro válido',
            );
        }

        if (size > this.maxFileSize) {
            throw new BadRequestException(
                'O ficheiro excede o tamanho máximo permitido de 100 MB',
            );
        }
    }

    validatePublicUploadFolder(folder: string): void {
        if (!this.publicFolders.includes(folder)) {
            throw new BadRequestException(
                'Esta pasta requer autenticação',
            );
        }
    }
}