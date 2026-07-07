export function getFirstAndLastName(fullName: string): string {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
        return "";
    }

    const nameParts = trimmedName.split(/\s+/);

    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    return lastName ? `${firstName} ${lastName}` : firstName;
}