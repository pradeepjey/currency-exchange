/**
 * Get formatted date string
 * @param date 
 * @returns formatd date string
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculate past date from today based on days count
 * @param days - number of days in the past
 * @returns calculated date
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateYYYYMMDD(date);
}

/**
 * Date string to date
 * @param dateString 
 * @returns date
 */
export function yyyyMmDdToDate(dateString: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}