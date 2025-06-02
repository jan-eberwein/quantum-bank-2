// components/SimpleMoneyTransfer.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useAllUsers } from '@/hooks/useAllUsers';
import { TransferService, TransferData } from '@/lib/transfer';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

type Step = 'input' | 'confirm' | 'processing' | 'success' | 'error';

interface TransferState {
    step: Step;
    amount: string;
    selectedUserId: string;
    description: string;
    error: string;
    transferId: string;
}

const SimpleMoneyTransfer: React.FC = () => {
    const { user, refreshUser } = useUser();
    const { users, loading: usersLoading } = useAllUsers();

    const [state, setState] = useState<TransferState>({
        step: 'input',
        amount: '',
        selectedUserId: '',
        description: '',
        error: '',
        transferId: ''
    });

    // Filter out current user from recipients
    const availableUsers = users.filter(u => u.$id !== user?.$id);
    const selectedUser = availableUsers.find(u => u.$id === state.selectedUserId);

    // Make transfer state readable by Copilot
    useCopilotReadable({
        description: "Current money transfer state and progress",
        value: {
            currentStep: state.step,
            amount: state.amount,
            selectedRecipient: selectedUser?.userId || null,
            description: state.description,
            availableRecipients: availableUsers.map(u => ({ id: u.$id, username: u.userId, email: u.email })),
            userBalance: user?.balance ? user.balance / 100 : 0,
        },
    });

    // CopilotKit action to start a transfer
    useCopilotAction({
        name: "startTransfer",
        description: "Start a money transfer by setting amount, recipient, and description",
        parameters: [
            {
                name: "amount",
                type: "string",
                description: "Amount to transfer (e.g., '50.00')",
                required: true,
            },
            {
                name: "recipientId",
                type: "string",
                description: "Recipient's user ID/username or email",
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
            setState(prev => ({
                ...prev,
                amount: amount.toString(),
                description: description || '',
                error: '',
                step: 'input'
            }));

            // Try to find recipient by username or email
            if (recipientId) {
                const recipient = availableUsers.find(u =>
                    u.userId.toLowerCase() === recipientId.toLowerCase() ||
                    u.email.toLowerCase() === recipientId.toLowerCase()
                );
                if (recipient) {
                    setState(prev => ({ ...prev, selectedUserId: recipient.$id }));
                }
            }
        },
    });

    // CopilotKit action to proceed to confirmation
    useCopilotAction({
        name: "proceedToConfirmation",
        description: "Move to the transfer confirmation step",
        handler: async () => {
            if (state.step === 'input') {
                handleContinue();
            }
        },
    });

    // CopilotKit action to confirm transfer
    useCopilotAction({
        name: "confirmTransfer",
        description: "Confirm and execute the money transfer",
        handler: async () => {
            if (state.step === 'confirm') {
                await handleConfirm();
            }
        },
    });

    // CopilotKit action to cancel transfer
    useCopilotAction({
        name: "cancelTransfer",
        description: "Cancel the current transfer and return to input",
        handler: async () => {
            resetForm();
        },
    });

    // CopilotKit action to select recipient
    useCopilotAction({
        name: "selectRecipient",
        description: "Select a recipient for the money transfer",
        parameters: [
            {
                name: "recipientIdentifier",
                type: "string",
                description: "Recipient's username or email",
                required: true,
            },
        ],
        handler: async ({ recipientIdentifier }) => {
            const recipient = availableUsers.find(u =>
                u.userId.toLowerCase() === recipientIdentifier.toLowerCase() ||
                u.email.toLowerCase() === recipientIdentifier.toLowerCase()
            );

            if (recipient) {
                setState(prev => ({
                    ...prev,
                    selectedUserId: recipient.$id,
                    error: ''
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: `Recipient "${recipientIdentifier}" not found`
                }));
            }
        },
    });

    // Listen for Copilot events
    useEffect(() => {
        const handleStartTransfer = (event: CustomEvent) => {
            const { amount, recipientId, description } = event.detail;
            setState(prev => ({
                ...prev,
                amount: amount || '',
                description: description || '',
                error: '',
                step: 'input'
            }));

            if (recipientId) {
                const recipient = availableUsers.find(u =>
                    u.userId.toLowerCase() === recipientId.toLowerCase() ||
                    u.email.toLowerCase() === recipientId.toLowerCase()
                );
                if (recipient) {
                    setState(prev => ({ ...prev, selectedUserId: recipient.$id }));
                }
            }
        };

        const handleConfirmTransfer = () => {
            if (state.step === 'confirm') {
                handleConfirm();
            }
        };

        const handleCancelTransfer = () => {
            resetForm();
        };

        window.addEventListener('copilot-start-transfer', handleStartTransfer as EventListener);
        window.addEventListener('copilot-confirm-transfer', handleConfirmTransfer);
        window.addEventListener('copilot-cancel-transfer', handleCancelTransfer);

        return () => {
            window.removeEventListener('copilot-start-transfer', handleStartTransfer as EventListener);
            window.removeEventListener('copilot-confirm-transfer', handleConfirmTransfer);
            window.removeEventListener('copilot-cancel-transfer', handleCancelTransfer);
        };
    }, [state.step, availableUsers]);

    const resetForm = () => {
        setState({
            step: 'input',
            amount: '',
            selectedUserId: '',
            description: '',
            error: '',
            transferId: ''
        });
    };

    const handleContinue = () => {
        // Basic validation
        const amount = parseFloat(state.amount);
        if (!amount || amount <= 0) {
            setState(prev => ({ ...prev, error: 'Please enter a valid amount' }));
            return;
        }

        if (!state.selectedUserId) {
            setState(prev => ({ ...prev, error: 'Please select a recipient' }));
            return;
        }

        if (!user || user.balance < amount * 100) {
            setState(prev => ({
                ...prev,
                error: `Insufficient balance. Available: €${user?.balance ? user.balance / 100 : 0}`
            }));
            return;
        }

        setState(prev => ({ ...prev, step: 'confirm', error: '' }));
    };

    const handleConfirm = async () => {
        if (!user) return;

        setState(prev => ({ ...prev, step: 'processing' }));

        const transferData: TransferData = {
            senderUserId: user.$id,
            receiverUserId: state.selectedUserId,
            amount: Math.round(parseFloat(state.amount) * 100), // Convert to cents
            description: state.description || 'Money Transfer'
        };

        const result = await TransferService.executeTransfer(transferData);

        if (result.success) {
            setState(prev => ({
                ...prev,
                step: 'success',
                transferId: result.transferId || ''
            }));
            // Refresh user data to show updated balance
            await refreshUser(true);
        } else {
            setState(prev => ({
                ...prev,
                step: 'error',
                error: result.error || 'Transfer failed'
            }));
        }
    };

    if (usersLoading) {
        return (
            <div className="p-4 bg-white rounded-xl shadow-md">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading users...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-black">Send Money</h2>
            </div>

            {state.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">{state.error}</span>
                </div>
            )}

            {/* INPUT STEP */}
            {state.step === 'input' && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                            Amount (€)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={state.amount}
                            onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="Enter amount"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">
                            Send to
                        </Label>
                        <Select value={state.selectedUserId} onValueChange={(value) =>
                            setState(prev => ({ ...prev, selectedUserId: value }))
                        }>
                            <SelectTrigger className="mt-1 bg-white border border-gray-300 rounded-lg">
                                <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {availableUsers.map((user) => (
                                    <SelectItem
                                        key={user.$id}
                                        value={user.$id}
                                        className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-medium text-gray-900">{user.userId}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Description (optional)
                        </Label>
                        <Input
                            id="description"
                            value={state.description}
                            onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="What's this for?"
                            className="mt-1"
                        />
                    </div>

                    <Button
                        onClick={handleContinue}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!state.amount || !state.selectedUserId}
                    >
                        Continue
                    </Button>
                </div>
            )}

            {/* CONFIRMATION STEP */}
            {state.step === 'confirm' && (
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600">You're about to send:</p>
                        <p className="text-2xl font-bold text-green-600">€{state.amount}</p>
                        <p className="text-sm text-gray-600">
                            To: <span className="font-medium">{selectedUser?.userId}</span>
                        </p>
                        {state.description && (
                            <p className="text-sm text-gray-500 mt-2">"{state.description}"</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
                            className="flex-1"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Confirm & Send
                        </Button>
                    </div>
                </div>
            )}

            {/* PROCESSING STEP */}
            {state.step === 'processing' && (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Processing your transfer...</p>
                </div>
            )}

            {/* SUCCESS STEP */}
            {state.step === 'success' && (
                <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-700">Transfer Successful!</h3>
                    <p className="text-sm text-gray-600 mt-2">
                        €{state.amount} sent to {selectedUser?.userId}
                    </p>
                    <Button
                        onClick={resetForm}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                        Send Another Transfer
                    </Button>
                </div>
            )}

            {/* ERROR STEP */}
            {state.step === 'error' && (
                <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-700">Transfer Failed</h3>
                    <p className="text-sm text-gray-600 mt-2">{state.error}</p>
                    <Button
                        onClick={() => setState(prev => ({ ...prev, step: 'input', error: '' }))}
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SimpleMoneyTransfer;