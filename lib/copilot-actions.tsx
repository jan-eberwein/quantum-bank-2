// lib/copilot-actions.ts
"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import { TransferService, TransferData } from "@/lib/transfer";
import { formatEuroCents } from "@/lib/format";
import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import TransferConfirmationComponent from "@/components/TransferConfirmationComponent";

export function useCustomVoiceActions() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const { users } = useAllUsers();

  // Make user balance and available recipients readable by Copilot
  useCopilotReadable({
    description: "Current user's balance in euros",
    value: user ? {
      balanceInEuros: user.balance / 100,
      formattedBalance: formatEuroCents(user.balance)
    } : null,
  });

  useCopilotReadable({
    description: "Available users to send money to",
    value: users.filter(u => u.$id !== user?.$id).map(u => ({
      id: u.$id,
      name: u.userId,
      email: u.email
    })),
  });

  // Navigation action (existing)
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

  // Settings toggle action (existing)
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

  // Send money action - Direct transfer
  useCopilotAction({
    name: "sendMoney",
    description: "Send money to another user",
    parameters: [
      {
        name: "recipientName",
        type: "string",
        description: "The username or email of the recipient",
        required: true,
      },
      {
        name: "amount",
        type: "number",
        description: "The amount to send in euros",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Optional description for the transfer",
        required: false,
      },
    ],
    handler: async ({ recipientName, amount, description }) => {
      if (!user) {
        console.error("No user logged in");
        return "You must be logged in to send money.";
      }

      // Find recipient by username or email
      const recipient = users.find(
          u => u.userId.toLowerCase() === recipientName.toLowerCase() ||
              u.email.toLowerCase() === recipientName.toLowerCase()
      );

      if (!recipient) {
        return `Could not find user "${recipientName}". Available users are: ${users
            .filter(u => u.$id !== user.$id)
            .map(u => u.userId)
            .join(", ")}`;
      }

      // Validate amount
      const amountInCents = Math.round(amount * 100);
      if (amountInCents <= 0) {
        return "Amount must be greater than zero.";
      }

      if (user.balance < amountInCents) {
        return `Insufficient balance. You have €${user.balance / 100}, but trying to send €${amount}.`;
      }

      // Execute transfer
      const transferData: TransferData = {
        senderUserId: user.$id,
        receiverUserId: recipient.$id,
        amount: amountInCents,
        description: description || `Transfer to ${recipient.userId}`
      };

      const result = await TransferService.executeTransfer(transferData);

      if (result.success) {
        await refreshUser(true);
        return `Successfully sent €${amount} to ${recipient.userId}. Your new balance is €${(user.balance - amountInCents) / 100}.`;
      } else {
        return `Transfer failed: ${result.error}`;
      }
    },
  });

  // Send money action with confirmation widget
  useCopilotAction({
    name: "sendMoneyWithConfirmation",
    description: "Send money to another user with in-chat confirmation",
    parameters: [
      {
        name: "recipientName",
        type: "string",
        description: "The username or email of the recipient",
        required: true,
      },
      {
        name: "amount",
        type: "number",
        description: "The amount to send in euros",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Optional description for the transfer",
        required: false,
      },
      {
        name: "useWidget",
        type: "boolean",
        description: "Whether to use the confirmation widget",
        required: false,
      },
    ],
    render: ({ recipientName, amount, description, useWidget = false }) => {
      if (!useWidget) return null;

      // Find recipient
      const recipient = users.find(
          u => u.userId.toLowerCase() === recipientName.toLowerCase() ||
              u.email.toLowerCase() === recipientName.toLowerCase()
      );

      if (!recipient) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">Could not find user "{recipientName}".</p>
              <p className="text-sm text-gray-600 mt-1">
                Available users: {users.filter(u => u.$id !== user?.$id).map(u => u.userId).join(", ")}
              </p>
            </div>
        );
      }

      // Validate amount
      const amountInCents = Math.round(amount * 100);
      if (amountInCents <= 0) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">Amount must be greater than zero.</p>
            </div>
        );
      }

      return (
          <TransferConfirmationComponent
              recipientName={recipient.userId}
              recipientEmail={recipient.email}
              amount={amount}
              description={description}
              senderBalance={user?.balance || 0}
              onConfirm={async () => {
                if (!user) {
                  throw new Error("User not logged in");
                }

                const transferData: TransferData = {
                  senderUserId: user.$id,
                  receiverUserId: recipient.$id,
                  amount: amountInCents,
                  description: description || `Transfer to ${recipient.userId}`
                };

                const result = await TransferService.executeTransfer(transferData);

                if (result.success) {
                  await refreshUser(true);
                } else {
                  throw new Error(result.error || "Transfer failed");
                }
              }}
              onDeny={() => {
                // Demo cancellation
              }}
          />
      );
    },
  });

  // Check balance action
  useCopilotAction({
    name: "checkBalance",
    description: "Check your current account balance",
    parameters: [],
    handler: async () => {
      if (!user) {
        return "You must be logged in to check your balance.";
      }
      return `Your current balance is €${user.balance / 100}.`;
    },
  });

  // View recent transfers action
  useCopilotAction({
    name: "viewRecentTransfers",
    description: "Navigate to the transactions page to view recent transfers",
    parameters: [
      {
        name: "filterType",
        type: "string",
        description: "Optional filter: 'incoming', 'outgoing', or 'all'",
        required: false,
      },
    ],
    handler: async ({ filterType }) => {
      const params = new URLSearchParams();

      if (filterType === "incoming") {
        params.set("transactionType", "incoming");
      } else if (filterType === "outgoing") {
        params.set("transactionType", "outgoing");
      }

      const queryString = params.toString();
      const url = queryString ? `/transactions?${queryString}` : "/transactions";

      router.push(url);
      return `Navigating to transactions page${filterType ? ` (showing ${filterType} transfers)` : ""}...`;
    },
  });

  // Request money action (placeholder)
  useCopilotAction({
    name: "requestMoney",
    description: "Request money from another user (creates a notification for them)",
    parameters: [
      {
        name: "fromUser",
        type: "string",
        description: "The username or email to request money from",
        required: true,
      },
      {
        name: "amount",
        type: "number",
        description: "The amount to request in euros",
        required: true,
      },
      {
        name: "reason",
        type: "string",
        description: "Reason for the request",
        required: false,
      },
    ],
    handler: async ({ fromUser, amount, reason }) => {
      // This is a placeholder for a money request feature
      // In a real implementation, this would create a notification or pending request
      return `Money request feature is not yet implemented. To receive money, ask ${fromUser} to send €${amount} to you${reason ? ` for: ${reason}` : ""}.`;
    },
  });

  // Demo transfer action
  useCopilotAction({
    name: "createDemoTransfer",
    description: "Create a demo transfer (for testing purposes)",
    parameters: [
      {
        name: "amount",
        type: "number",
        description: "Demo amount in euros",
        required: true,
      },
    ],
    render: ({ amount }) => {
      return (
          <TransferConfirmationComponent
              recipientName="Demo User"
              recipientEmail="demo@example.com"
              amount={amount}
              description="Demo transfer for testing"
              senderBalance={user?.balance || 100000}
              onConfirm={async () => {
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Simulate success
              }}
              onDeny={() => {
                // Demo cancellation
              }}
          />
      );
    },
  });
}