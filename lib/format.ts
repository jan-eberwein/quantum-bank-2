export function formatEuroCents(cents: number): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(cents / 100);
}
