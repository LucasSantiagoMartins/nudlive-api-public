import { BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from '../dtos/profile.dto';
import { validateDate } from '@nudlive/common/utils/date.utils';

export class ProfileValidator {
  validateUpdate(data: UpdateProfileDto) {
    if (data.bio && data.bio.length > 500) {
      throw new BadRequestException('A biografia não pode exceder 500 caracteres');
    }

    if (data.birthDate) {
      validateDate(data.birthDate.toString(), {
        mustBePast: true,
        minAge: 18,
        fieldName: 'A data de nascimento'
      });
    }
  }
}