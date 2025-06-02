// lib/copilot-actions.ts
"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";

export function useEnhancedCopilotActions() {
  const router = useRouter();

  // Enhanced navigation action
  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to any page in the application including specific sections",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "The target page: 'home', 'dashboard', 'transactions', 'settings', 'sign-in', 'sign-out'",
        required: true,
      },
    ],
    handler: async ({ page }: { page: string }) => {
      const normalizedPage = page.toLowerCase().trim();

      switch (normalizedPage) {
        case "home":
        case "dashboard":
        case "start":
        case "übersicht":
          router.push("/");
          break;
        case "transactions":
        case "transaktionen":
        case "transaction history":
        case "payments":
          router.push("/transactions");
          break;
        case "settings":
        case "account settings":
        case "profile":
        case "einstellungen":
          router.push("/settings");
          break;
        case "sign-out":
        case "logout":
        case "log out":
          // Trigger logout through event
          window.dispatchEvent(new CustomEvent("copilot-logout"));
          break;
        case "sign-in":
        case "login":
        case "log in":
          router.push("/sign-in");
          break;
        default:
          console.warn("Unrecognized page:", page);
          break;
      }
    },
  });

  // Transaction filtering actions
  useCopilotAction({
    name: "filterTransactions",
    description: "Filter transactions by various criteria like search term, category, status, type, or date range",
    parameters: [
      {
        name: "searchTerm",
        type: "string",
        description: "Search for transactions by merchant name or description",
        required: false,
      },
      {
        name: "category",
        type: "string",
        description: "Filter by category: 'All Categories', 'Food & Beverages', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Housing', 'Salary', etc.",
        required: false,
      },
      {
        name: "status",
        type: "string",
        description: "Filter by status: 'All Statuses', 'Completed', 'Pending', 'Processing'",
        required: false,
      },
      {
        name: "transactionType",
        type: "string",
        description: "Filter by type: 'Incoming & Outgoing', 'incoming', 'outgoing'",
        required: false,
      },
      {
        name: "dateFrom",
        type: "string",
        description: "Start date for filtering (YYYY-MM-DD format)",
        required: false,
      },
      {
        name: "dateTo",
        type: "string",
        description: "End date for filtering (YYYY-MM-DD format)",
        required: false,
      },
    ],
    handler: async ({ searchTerm, category, status, transactionType, dateFrom, dateTo }) => {
      // Dispatch event to update transaction filters
      const filterData = {
        searchTerm: searchTerm || "",
        category: category || "All Categories",
        status: status || "All Statuses",
        transactionType: transactionType || "Incoming & Outgoing",
        dateFrom,
        dateTo,
      };

      window.dispatchEvent(
          new CustomEvent("copilot-filter-transactions", {
            detail: filterData,
          })
      );
    },
  });

  // Clear transaction filters
  useCopilotAction({
    name: "clearTransactionFilters",
    description: "Clear all applied transaction filters to show all transactions",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-clear-filters"));
    },
  });

  // Money transfer actions
  useCopilotAction({
    name: "startMoneyTransfer",
    description: "Start the money transfer process by setting the amount and recipient",
    parameters: [
      {
        name: "amount",
        type: "string",
        description: "Amount to transfer (e.g., '50.00', '100')",
        required: true,
      },
      {
        name: "recipientId",
        type: "string",
        description: "Recipient's user ID or email",
        required: false,
      },
      {
        name: "description",
        type: "string",
        description: "Optional description for the transfer",
        required: false,
      },
    ],
    handler: async ({ amount, recipientId, description }) => {
      window.dispatchEvent(
          new CustomEvent("copilot-start-transfer", {
            detail: { amount, recipientId, description },
          })
      );
    },
  });

  useCopilotAction({
    name: "confirmMoneyTransfer",
    description: "Confirm and execute the current money transfer",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-confirm-transfer"));
    },
  });

  useCopilotAction({
    name: "cancelMoneyTransfer",
    description: "Cancel the current money transfer and return to the input form",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-cancel-transfer"));
    },
  });

  // Account settings actions
  useCopilotAction({
    name: "updateAccountSettings",
    description: "Update account settings like dark mode, notifications, or profile information",
    parameters: [
      {
        name: "settingType",
        type: "string",
        description: "Type of setting: 'darkMode', 'notifications', 'username', 'email'",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "New value for the setting (for boolean settings use 'true'/'false')",
        required: true,
      },
      {
        name: "notificationType",
        type: "string",
        description: "For notifications: 'all', 'general', 'security', 'updates'",
        required: false,
      },
    ],
    handler: async ({ settingType, value, notificationType }) => {
      const settingData = {
        settingType: settingType.toLowerCase(),
        value,
        notificationType: notificationType?.toLowerCase(),
      };

      window.dispatchEvent(
          new CustomEvent("copilot-update-setting", {
            detail: settingData,
          })
      );
    },
  });

  // Query account information
  useCopilotAction({
    name: "getAccountInfo",
    description: "Get current account information including balance, settings, and profile data",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-get-account-info"));
    },
  });

  // Search for specific transactions
  useCopilotAction({
    name: "searchTransactions",
    description: "Search for specific transactions by merchant, amount, or description",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Search term (merchant name, description, or amount)",
        required: true,
      },
      {
        name: "exactAmount",
        type: "string",
        description: "Exact amount to search for (optional)",
        required: false,
      },
    ],
    handler: async ({ query, exactAmount }) => {
      let searchTerm = query;
      if (exactAmount) {
        searchTerm += ` ${exactAmount}`;
      }

      window.dispatchEvent(
          new CustomEvent("copilot-filter-transactions", {
            detail: {
              searchTerm,
              category: "All Categories",
              status: "All Statuses",
              transactionType: "Incoming & Outgoing",
            },
          })
      );
    },
  });

  // Navigate to specific transaction page
  useCopilotAction({
    name: "goToTransactionPage",
    description: "Navigate to transactions page with optional page number",
    parameters: [
      {
        name: "pageNumber",
        type: "string",
        description: "Page number to navigate to (default: 1)",
        required: false,
      },
    ],
    handler: async ({ pageNumber }) => {
      const page = pageNumber ? parseInt(pageNumber) : 1;
      router.push(`/transactions?page=${page}`);
    },
  });

  // Quick balance check
  useCopilotAction({
    name: "checkBalance",
    description: "Get the current account balance",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-check-balance"));
    },
  });

  // Toggle specific settings
  useCopilotAction({
    name: "toggleSetting",
    description: "Toggle boolean settings like dark mode or notifications on/off",
    parameters: [
      {
        name: "setting",
        type: "string",
        description: "Setting to toggle: 'darkMode', 'notifications', 'generalNotifications', 'securityNotifications', 'updateNotifications'",
        required: true,
      },
    ],
    handler: async ({ setting }) => {
      window.dispatchEvent(
          new CustomEvent("copilot-toggle-setting", {
            detail: { setting: setting.toLowerCase() },
          })
      );
    },
  });

  // Advanced transaction actions
  useCopilotAction({
    name: "filterTransactionsByDateRange",
    description: "Filter transactions within a specific date range",
    parameters: [
      {
        name: "startDate",
        type: "string",
        description: "Start date (YYYY-MM-DD or natural language like 'last week', 'this month')",
        required: true,
      },
      {
        name: "endDate",
        type: "string",
        description: "End date (YYYY-MM-DD) - optional if using natural language",
        required: false,
      },
    ],
    handler: async ({ startDate, endDate }) => {
      let dateFrom: string | undefined;
      let dateTo: string | undefined;

      // Handle natural language dates
      const now = new Date();
      if (startDate.toLowerCase().includes('last week')) {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFrom = weekAgo.toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
      } else if (startDate.toLowerCase().includes('this month')) {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFrom = monthStart.toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
      } else if (startDate.toLowerCase().includes('last month')) {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        dateFrom = lastMonthStart.toISOString().split('T')[0];
        dateTo = lastMonthEnd.toISOString().split('T')[0];
      } else {
        dateFrom = startDate;
        dateTo = endDate;
      }

      window.dispatchEvent(
          new CustomEvent("copilot-filter-transactions", {
            detail: {
              searchTerm: "",
              category: "All Categories",
              status: "All Statuses",
              transactionType: "Incoming & Outgoing",
              dateFrom,
              dateTo,
            },
          })
      );
    },
  });

  // Find transactions by amount range
  useCopilotAction({
    name: "filterTransactionsByAmount",
    description: "Filter transactions by amount or amount range",
    parameters: [
      {
        name: "minAmount",
        type: "string",
        description: "Minimum amount (e.g., '10.00')",
        required: false,
      },
      {
        name: "maxAmount",
        type: "string",
        description: "Maximum amount (e.g., '100.00')",
        required: false,
      },
      {
        name: "exactAmount",
        type: "string",
        description: "Exact amount to find (e.g., '50.00')",
        required: false,
      },
    ],
    handler: async ({ minAmount, maxAmount, exactAmount }) => {
      let searchTerm = "";

      if (exactAmount) {
        searchTerm = exactAmount;
      } else if (minAmount || maxAmount) {
        if (minAmount && maxAmount) {
          searchTerm = `amount between ${minAmount} and ${maxAmount}`;
        } else if (minAmount) {
          searchTerm = `amount above ${minAmount}`;
        } else if (maxAmount) {
          searchTerm = `amount below ${maxAmount}`;
        }
      }

      window.dispatchEvent(
          new CustomEvent("copilot-filter-transactions", {
            detail: {
              searchTerm,
              category: "All Categories",
              status: "All Statuses",
              transactionType: "Incoming & Outgoing",
            },
          })
      );
    },
  });

  // Logout action
  useCopilotAction({
    name: "logout",
    description: "Log out of the application",
    handler: async () => {
      window.dispatchEvent(new CustomEvent("copilot-logout"));
    },
  });
}

// Legacy action for backwards compatibility
export function useCustomVoiceActions() {
  const router = useRouter();

  useCopilotAction({
    name: "navigateToPage",
    description: "Navigates to a specific page",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "The target page to navigate to (e.g., 'transactions', 'dashboard', 'settings')",
        required: true,
      },
    ],
    handler: async ({ page }: { page: string }) => {
      switch (page.toLowerCase()) {
        case "transactions":
        case "transaktionen":
          router.push("/transactions");
          break;
        case "settings":
        case "einstellungen":
          router.push("/settings");
          break;
        case "dashboard":
        case "start":
        case "home":
        case "übersicht":
          router.push("/");
          break;
        default:
          console.warn("Unrecognized page:", page);
          break;
      }
    },
  });

  useCopilotAction({
    name: "toggleSetting",
    description: "Toggles a user setting like dark mode or notifications",
    parameters: [
      {
        name: "setting",
        type: "string",
        description: "The setting to toggle (e.g., 'darkMode', 'notifications')",
        required: true,
      },
      {
        name: "value",
        type: "boolean",
        description: "New value (true to enable, false to disable)",
        required: true,
      },
    ],
    handler: async ({ setting, value }: { setting: string; value: boolean }) => {
      const event = new CustomEvent("copilot-setting-toggle", {
        detail: { setting, value },
      });
      window.dispatchEvent(event);
    },
  });
}