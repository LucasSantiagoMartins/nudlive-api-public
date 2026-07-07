import { BadRequestException } from "@nestjs/common";

export function validateDate(
    dateStr: string,
    options: {
        mustBePast?: boolean,
        mustBeFuture?: boolean,
        minAge?: number,
        fieldName?: string
    }
) {
    const date = new Date(dateStr);
    const label = options.fieldName || 'A data';

    if (isNaN(date.getTime())) {
        throw new BadRequestException(`${label} introduzida não é válida`);
    }

    const now = new Date();

    if (options.mustBePast && date >= now) {
        throw new BadRequestException(`${label} deve ser uma data anterior ao momento atual`);
    }

    if (options.mustBeFuture && date <= now) {
        throw new BadRequestException(`${label} deve ser uma data posterior ao momento atual`);
    }

    if (options.minAge) {
        let age = now.getFullYear() - date.getFullYear();
        const monthDiff = now.getMonth() - date.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
            age--;
        }

        if (age < options.minAge) {
            throw new BadRequestException(`É necessário ter pelo menos ${options.minAge} anos`);
        }
    }
}

export const formatDateFriendly = (
    date: string | Date,
    withTime: boolean = false,
): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric",
    };

    if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
    }

    const formattedDate = dateObj.toLocaleDateString("pt-BR", options);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};