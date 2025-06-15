import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jwt from 'jsonwebtoken';
export const PAGINATION_PER_PAGE = 5;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  dateValue: string | { seconds: number; nanoseconds: number } | null
) => {
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (e) {
      return 'N/A';
    }
  }
  if (dateValue && typeof dateValue.seconds === 'number') {
    const date = new Date(dateValue.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  }
  return 'N/A';
};

/**
 * Formats a number as a currency string for Tunisian Dinar (TND).
 * @param value The number to format.
 * @returns A string representing the value in TND format (e.g., "١٢٬٣٤٥٫٦٨ د.ت.‏").
 */
/**
 * Formats a number as a currency string for Tunisian Dinar (TND).
 * @param value The number to format.
 * @returns A string representing the value in TND format (e.g., "١٢٬٣٤٥٫٦٨ د.ت.‏").
 */
export const formatCurrency = (value: unknown): string => {
  // If value is a number, use it directly
  if (typeof value === 'number' && !isNaN(value)) {
    return new Intl.NumberFormat('en-TN', { style: 'currency', currency: 'TND' }).format(value);
  }

  // If value is a numeric string, convert to number
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return new Intl.NumberFormat('en-TN', { style: 'currency', currency: 'TND' }).format(num);
    }
  }

  // Fallback if value is invalid
  return '0 د.ت.';
};
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return false;
    return decoded.exp * 1000 > Date.now(); // Check expiration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};