import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney } from '@/lib/format-money';

// 1. Install dependencies if you haven't: 
// npm install clsx tailwind-merge

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to format currency consistently
export const formatCurrency = (amount: number) => {
  return formatMoney(Math.round(amount * 100));
};
