/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mo')
    year: "numeric",
    month: "short", // abbreviated month name (e.g., 'Okt')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // don't use 24-hour clock
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mo')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // two-digit month (e.g., '10')
    day: "2-digit", // two-digit day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Okt')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // don't use 24-hour clock
  };

  const dayMonthOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Okt')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
      "en-US",
      dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
      "en-US",
      dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
      "en-US",
      dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
      "en-US",
      timeOptions
  );

  const formattedDayMonth: string = new Date(dateString).toLocaleString(
      "en-US",
      dayMonthOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
    dayMonth: formattedDayMonth,
  };
};


/**
 * Format amount from cents to EUR currency
 * @param amountInCents - Amount in cents (integer)
 * @returns Formatted currency string
 */
export function formatAmount(amountInCents: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  // Convert cents to euros by dividing by 100
  return formatter.format(amountInCents / 100);
}

/**
 * Format amount from cents to EUR with proper locale (German format)
 * @param amountInCents - Amount in cents (integer)
 * @returns Formatted currency string in German locale
 */
export function formatAmountEuro(amountInCents: number): string {
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  return formatter.format(amountInCents / 100);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  if (typeof value !== 'string') {
    return '';  // or handle it in a way that suits your needs
  }
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
      {
        url: window.location.pathname,
        query: currentUrl,
      },
      { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };

    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };

    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
    transactions: Transaction[]
): CategoryCount[] {
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  transactions &&
  transactions.forEach((transaction) => {
    const category = transaction.category;

    if (categoryCounts.hasOwnProperty(category)) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }

    totalCount++;
  });

  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
      (category) => ({
        name: category,
        count: categoryCounts[category],
        totalCount,
      })
  );

  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  const parts = url.split("/");
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

/**
 * Get transaction/transfer status based on date
 * Now returns status IDs from environment variables instead of hardcoded strings
 */
export const getTransactionStatusId = (date: Date): string => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  // Return appropriate status ID based on date
  return date > twoDaysAgo
      ? process.env.NEXT_PUBLIC_APPWRITE_PENDING_STATUS_ID!
      : process.env.NEXT_PUBLIC_APPWRITE_COMPLETED_STATUS_ID!;
};

/**
 * Legacy function for backward compatibility - now returns string status names
 */
export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Pending" : "Completed";
};

export const authFormSchema = (type: string) => z.object({
  firstName: type === "sign-in" ? z.string().optional() : z.string().min(3),
  lastName: type === "sign-in" ? z.string().optional() : z.string().min(3),
  address1: type === "sign-in" ? z.string().optional() : z.string().max(50),
  city: type === "sign-in" ? z.string().optional() : z.string().max(50),
  state: type === "sign-in" ? z.string().optional() : z.string().min(2).max(2),
  postalCode: type === "sign-in" ? z.string().optional() : z.string().min(3).max(6),
  dateOfBirth: type === "sign-in" ? z.string().optional() : z.string().min(3),
  ssn: type === "sign-in" ? z.string().optional() : z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export const mapTransactionApiToTransaction = (
    transaction: TransactionApi,
    accountId: number
): Transaction => ({
  $id: transaction.transaction_id.toString(),
  name: transaction.description,
  accountId: transaction.sender_account_id.toString(),
  amount:
      accountId === transaction.recipient_account_id
          ? Math.abs(transaction.amount) // Positive if received
          : -Math.abs(transaction.amount), // Negative if sent
  pending: transaction.status_name === "Pending", // Map "Pending" status
  category: transaction.category_name || "Uncategorized",
  date: new Date(transaction.transaction_date).toISOString(),
  $createdAt: new Date(transaction.transaction_date).toISOString(),
});

export function generateCardNumber(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}