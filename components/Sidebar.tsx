// components/Sidebar.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserCard from "./UserCard";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { format } from "date-fns";
import { useUser } from "@/context/UserContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import { TransferService, TransferData } from "@/lib/transfer";
import { formatEuroCents } from "@/lib/format";
import TransferConfirmationComponent from "@/components/TransferConfirmationComponent";

// Dynamically import CopilotUI (no CopilotKit integration - just voice input)
const CopilotUI = dynamic(() => import("./CopilotUI"), { ssr: false });

interface SidebarProps {
  user: { [key: string]: any } | null;
}

const Sidebar = ({ user: userProp }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshUser } = useUser(); // Get user from context for actions
  const { users } = useAllUsers();

  // Format amount helper
  const formatAmount = (value: number | undefined | null) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  // ================================
  // ALL COPILOT READABLES
  // ================================

  useCopilotReadable({
    description: "The available pages/parts of the application",
    value: sidebarLinks,
  });

  useCopilotReadable({
    description: "The currently signed in user",
    value: user,
  });

  useCopilotReadable({
    description: "The current date in yyyy-MM-dd format",
    value: format(new Date(), "yyyy-MM-dd"),
  });

  useCopilotReadable({
    description: "Current user balance and available transfer recipients",
    value: {
      currentUser: user ? {
        id: user.$id,
        name: user.userId,
        email: user.email,
        balance: formatAmount(user.balance / 100),
        formattedBalance: formatEuroCents(user.balance)
      } : null,
      availableRecipients: users
          .filter(u => u.$id !== user?.$id)
          .map(u => ({
            id: u.$id,
            name: u.userId,
            email: u.email
          }))
    },
  });

  // ================================
  // ALL COPILOT ACTIONS
  // ================================

  useCopilotAction({
    name: "sendMoney",
    description: `Send money with MANDATORY in-chat confirmation widget. 
    
    CRITICAL SECURITY RULE: This action ALWAYS shows a confirmation widget first. 
    There is NO way to bypass confirmation. No direct transfers allowed.
    
    Usage: When user wants to send money, ALWAYS use this action and let the widget handle confirmation.`,
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
        description: "The amount to send in euros (will be formatted to 2 decimal places)",
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
        return "❌ You must be logged in to send money.";
      }

      if (!recipientName || typeof recipientName !== 'string') {
        return "❌ Please provide a valid recipient name or email.";
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return "❌ Please provide a valid amount greater than zero.";
      }

      const recipient = users.find(
          u => u.userId?.toLowerCase() === recipientName.toLowerCase() ||
              u.email?.toLowerCase() === recipientName.toLowerCase()
      );

      if (!recipient) {
        const availableUsers = users
            .filter(u => u.$id !== user.$id && u.userId)
            .map(u => u.userId)
            .slice(0, 5);

        return `❌ Could not find user "${recipientName}". Available users: ${availableUsers.join(", ")}`;
      }

      const amountInCents = Math.round(amount * 100);
      if (user.balance < amountInCents) {
        return `❌ Insufficient funds. Your balance: €${formatAmount(user.balance / 100)}, required: €${formatAmount(amount)}`;
      }

      return `🔒 Transfer prepared: €${formatAmount(amount)} to ${recipient.userId}. Please confirm in the widget below.`;
    },
    render: ({ status, args }) => {
      if (!user || !args) return <div>Loading...</div>;

      const { recipientName, amount, description } = args as {
        recipientName: string,
        amount: number,
        description?: string
      };

      const recipient = users.find(
          u => u.userId?.toLowerCase() === recipientName?.toLowerCase() ||
              u.email?.toLowerCase() === recipientName?.toLowerCase()
      );

      if (!recipient) {
        return (
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <p className="text-red-700">❌ Recipient "{recipientName}" not found.</p>
              <p className="text-sm text-gray-600 mt-1">
                Available users: {users.filter(u => u.$id !== user?.$id && u.userId).map(u => u.userId).join(", ")}
              </p>
            </div>
        );
      }

      return (
          <TransferConfirmationComponent
              recipientName={recipient.userId}
              recipientEmail={recipient.email}
              amount={amount}
              description={description}
              senderBalance={user.balance}
              onConfirm={async () => {
                const amountInCents = Math.round(amount * 100);

                if (user.balance < amountInCents) {
                  throw new Error("Insufficient funds");
                }

                const transferData: TransferData = {
                  senderUserId: user.$id,
                  receiverUserId: recipient.$id,
                  amount: amountInCents,
                  description: description || `Transfer to ${recipient.userId}`
                };

                const result = await TransferService.executeTransfer(transferData);

                if (!result.success) {
                  throw new Error(result.error || 'Transfer failed');
                }

                await refreshUser(true);
              }}
              onDeny={() => {
                // Cancellation handled by component
              }}
          />
      );
    },
  });

  useCopilotAction({
    name: "checkBalance",
    description: "Check your current account balance",
    parameters: [],
    handler: async () => {
      if (!user) {
        return "❌ You must be logged in to check your balance.";
      }
      return `💰 Your current balance is €${formatAmount(user.balance / 100)}`;
    },
  });

  useCopilotAction({
    name: "listRecipients",
    description: "List all available users for money transfers",
    parameters: [],
    handler: async () => {
      if (!user) {
        return "❌ You must be logged in to view recipients.";
      }

      const availableUsers = users
          .filter(u => u.$id !== user.$id)
          .map(u => `• ${u.userId} (${u.email})`)
          .slice(0, 10);

      if (availableUsers.length === 0) {
        return "📭 No other users available for transfers.";
      }

      return `👥 **Available Recipients:**\n\n${availableUsers.join('\n')}\n\n🔒 To send money securely, say: "Send €${formatAmount(50)} to [username]"`;
    },
  });

  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to a specific page",
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
          return "🧭 Navigating to transactions page...";
        case "settings":
        case "einstellungen":
          router.push("/settings");
          return "🧭 Navigating to settings page...";
        case "dashboard":
        case "start":
        case "home":
        case "übersicht":
          router.push("/");
          return "🧭 Navigating to dashboard...";
        default:
          return `❌ Unknown page: ${page}. Available pages: transactions, settings, dashboard`;
      }
    },
  });

  useCopilotAction({
    name: "viewTransactions",
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
      return `🧭 Navigating to transactions page${filterType ? ` (showing ${filterType} transfers)` : ""}...`;
    },
  });

  useCopilotAction({
    name: "toggleSetting",
    description: "Toggle a user setting like dark mode or notifications",
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
      return `⚙️ Setting ${setting} has been ${value ? 'enabled' : 'disabled'}.`;
    },
  });

  // ================================
  // VOICE COMMAND INTEGRATION
  // ================================

  // Provide direct action handlers for voice commands
  const voiceActionHandlers = {
    navigateToPage: (page: string) => {
      switch (page.toLowerCase()) {
        case "transactions":
        case "transaction":
          router.push("/transactions");
          return "Navigating to transactions page";
        case "settings":
        case "setting":
          router.push("/settings");
          return "Navigating to settings page";
        case "dashboard":
        case "home":
        case "start":
          router.push("/");
          return "Navigating to dashboard";
        default:
          return `Unknown page: ${page}`;
      }
    },
    checkBalance: () => {
      if (user) {
        const balance = (user.balance / 100).toFixed(2);
        return `Your current balance is ${balance} euros`;
      }
      return "Please log in to check your balance";
    },
    listRecipients: () => {
      if (user) {
        const recipients = users
            .filter(u => u.$id !== user.$id)
            .map(u => u.userId)
            .slice(0, 5);
        return `Available recipients: ${recipients.join(', ')}`;
      }
      return "Please log in to view recipients";
    }
  };

  return (
      <section className="sidebar flex flex-col h-full">
        <nav className="flex flex-col gap-4">
          {/* Logo */}
          <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
            <div className="w-full max-w-[400px] mx-auto hidden sm:block lg:hidden">
              <Image
                  src="/icons/QuantumLogo_small.png"
                  layout="responsive"
                  width={16}
                  height={9}
                  alt="Quantum small logo"
                  className="sidebar-logo-tablet"
              />
            </div>
            <div className="w-full max-w-[400px] mx-auto hidden lg:block">
              <Image
                  src="/icons/QuantumLogo.png"
                  layout="responsive"
                  width={16}
                  height={9}
                  alt="Quantum logo"
                  className="sidebar-logo"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          {sidebarLinks.map((item) => {
            const isActive =
                pathname === item.route || pathname.startsWith(`${item.route}/`);

            return (
                <Link
                    href={item.route}
                    key={item.label}
                    className={cn(
                        "sidebar-link flex items-center gap-2 p-3 rounded-lg transition-colors",
                        { "bg-bank-gradient text-white": isActive }
                    )}
                >
                  <div className="relative size-6">
                    <Image
                        src={item.imgURL}
                        alt={item.label}
                        fill
                        className={cn("brightness-0", {
                          "brightness-[3] invert-0": isActive,
                        })}
                    />
                  </div>
                  <p
                      className={cn("sidebar-label text-gray-700", {
                        "!text-white": isActive,
                      })}
                  >
                    {item.label}
                  </p>
                </Link>
            );
          })}
        </nav>

        {/* CopilotUI with voice handlers */}
        <CopilotUI voiceActionHandlers={voiceActionHandlers} />

        <UserCard />
      </section>
  );
};

export default Sidebar;