import { BadRequestException } from "@nestjs/common";
import { LoginDto } from "../dtos/login.dto";
import { PhoneNumberUtils } from "../../user/utils/phone-number.utils";
import { EmailUtils } from "../../user/utils/email.utils";

export class AuthValidator {
    validateLogin(data: LoginDto) {
        const { identifier, password } = data;

        if (!identifier || !password) {
            throw new BadRequestException(
                "E-mail ou número de telefone e a senha devem ser informados"
            );
        }

        const trimmedIdentifier = identifier.trim();
        const isPhone = PhoneNumberUtils.isPhoneNumberFormat(trimmedIdentifier);
        const isEmail = EmailUtils.isEmailFormat(trimmedIdentifier);

        if (!isPhone && !isEmail) {
            throw new BadRequestException(
                "Informe um e-mail válido ou um número de telefone válido"
            );
        }

        if (isPhone) {
            PhoneNumberUtils.validate(trimmedIdentifier);
        }

        if (isEmail) {
            EmailUtils.validate(trimmedIdentifier);
        }
    }
}
