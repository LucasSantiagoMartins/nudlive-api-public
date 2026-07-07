import { BadRequestException } from '@nestjs/common';

export class EmailUtils {
    static isEmailFormat(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return emailRegex.test(value);
    }

    static validate(value: string, errMessage?: string) {
        if (!this.isEmailFormat(value)) {
            throw new BadRequestException(errMessage ?? 'E-mail inválido');
        }
        return true;
    }
}
