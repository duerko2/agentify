export function toDateStringFormat(date: Date): string {
    // Return the date in format MONTH DD YYYY not localized
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    return `${month} ${date.getDate()} ${date.getFullYear()}`;
}