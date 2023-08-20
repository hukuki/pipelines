export function isValidDate(d: Date) {
    return d instanceof Date && !isNaN(d.getTime());
}