import { BadRequestException } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { EmailUtils } from '../utils/email.utils';
import { PhoneNumberUtils } from '../utils/phone-number.utils';
import { validatePassword } from '../utils/password.utils';
import { validateDate } from '@shared/utils/date.utils';
import { UserRole } from '@shared/enums/user-role.enum';

export class UserValidator {
  validateCreateUser(data: RegisterUserDto) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Por favor, preencha os dados para criação da conta');
    }

    const { email, phoneNumber, password, fullName, username, birthDate } = data;

    if (!email && !phoneNumber) {
      throw new BadRequestException('Por favor, informe o e-mail ou número de telefone');
    }

    if (!password) {
      throw new BadRequestException('Por favor, informe a sua senha');
    }

    if (!fullName || fullName.trim().length === 0) {
      throw new BadRequestException('O nome completo é obrigatório');
    }

    if (!username) {
      throw new BadRequestException('O nome de utilizador é obrigatório');
    }

    if (!birthDate) {
      throw new BadRequestException('A data de nascimento é obrigatória');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('O nome de utilizador deve conter apenas caracteres alfanuméricos e underscores');
    }

    if (!Object.values(UserRole).includes(data.role)) {
      throw new BadRequestException('O tipo de conta selecionado não suportado');
    }

    if ([UserRole.ADMIN, UserRole.MODERATOR].includes(data.role)) {
      throw new BadRequestException('Tipo de conta inválido');
    }

    if (email) {
      EmailUtils.validate(email);
    }

    if (phoneNumber) {
      PhoneNumberUtils.validate(phoneNumber);
    }

    validatePassword(password);

    validateDate(birthDate.toString(), {
      mustBePast: true,
      minAge: 18,
      fieldName: 'A data de nascimento'
    });

    return true;
  }
}