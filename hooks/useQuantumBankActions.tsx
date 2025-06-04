// hooks/useQuantumBankActions.tsx
"use client";

import React from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import { TransferService, TransferData } from "@/lib/transfer";
import { formatEuroCents } from "@/lib/format";
import TransferConfirmationComponent from "@/components/TransferConfirmationComponent";

export function useQuantumBankActions() {
    const router = useRouter();
    const { user, refreshUser } = useUser();
    const { users } = useAllUsers();

    // Format amount to always show 2 decimal places
    const formatAmount = (value: number | undefined | null) => {
        if (typeof value !== 'number' || isNaN(value)) return '0.00';
        return value.toFixed(2);
    };

    // Make user data readable by Copilot
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

    // ===============================
    // SECURE TRANSFER ACTIONS (CONFIRMATION MANDATORY)
    // ===============================

    // ONLY transfer action - always uses in-chat confirmation
    useCopilotAction({
        name: "sendMoneyInChat",
        description: "Send money with mandatory in-chat confirmation widget (ONLY method for transfers)",
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

            // Validate input parameters
            if (!recipientName || typeof recipientName !== 'string') {
                return "❌ Please provide a valid recipient name or email.";
            }

            if (!amount || typeof amount !== 'number') {
                return "❌ Please provide a valid amount.";
            }

            // Find recipient with safe string operations
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

            // Validate amount
            if (amount <= 0) {
                return "❌ Amount must be greater than zero.";
            }

            return `🔒 Setting up secure transfer confirmation for €${formatAmount(amount)} to ${recipient.userId}...`;
        },
        render: ({ status, args }) => {
            if (!user || !args) return <div>Loading...</div>;

            const { recipientName, amount, description } = args;

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

    // Redirect any direct transfer attempts to secure confirmation
    useCopilotAction({
        name: "sendMoneyDirect",
        description: "DEPRECATED: Redirects to secure confirmation - all transfers require confirmation",
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
            // Validate input parameters
            if (!recipientName || typeof recipientName !== 'string') {
                return "❌ Please provide a valid recipient name or email.";
            }

            if (!amount || typeof amount !== 'number') {
                return "❌ Please provide a valid amount.";
            }

            return `🔒 For your security and financial protection, all transfers require confirmation. I'll show you the secure confirmation widget where you can review all details before proceeding.

Amount: €${formatAmount(amount)}
Recipient: ${recipientName}
${description ? `Description: ${description}` : ''}

The confirmation widget will appear below this message.`;
        },
        render: ({ status, args }) => {
            if (!user || !args) return <div>Loading...</div>;

            const { recipientName, amount, description } = args;

            const recipient = users.find(
                u => u.userId?.toLowerCase() === recipientName?.toLowerCase() ||
                    u.email?.toLowerCase() === recipientName?.toLowerCase()
            );

            if (!recipient) {
                return (
                    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <p className="text-red-700">❌ Recipient "{recipientName}" not found.</p>
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

    // ===============================
    // ACCOUNT ACTIONS
    // ===============================

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

    // ===============================
    // NAVIGATION ACTIONS
    // ===============================

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

    // ===============================
    // SETTINGS ACTIONS
    // ===============================

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
}