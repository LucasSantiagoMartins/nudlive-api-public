import { BadRequestException } from '@nestjs/common';

export class PhoneNumberUtils {
  static isPhoneNumberFormat(value: string): boolean {
    const validPhoneRegex = /^(\+244\s?)?9\d{8}$/;
    return validPhoneRegex.test(value);
  }

  static validate(phone: string) {
    if (!this.isPhoneNumberFormat(phone)) {
      throw new BadRequestException('Número de telefone inválido');
    }
    return true;
  }
}
