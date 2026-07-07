export const formatPrice = (price: number, includeSymbol: boolean = true) => {
    const formatted = new Intl.NumberFormat("de-DE", {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(price);

    if (!includeSymbol) {
        return formatted;
    }

    return `${formatted} Kz`;
};