import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Send, AlertTriangle, User, CreditCard } from 'lucide-react';

interface TransferConfirmationProps {
    recipientName: string;
    recipientEmail: string;
    amount: number;
    description?: string;
    senderBalance: number;
    onConfirm: () => Promise<void>;
    onDeny: () => void;
}

const TransferConfirmationComponent: React.FC<TransferConfirmationProps> = ({
                                                                                recipientName,
                                                                                recipientEmail,
                                                                                amount,
                                                                                description,
                                                                                senderBalance,
                                                                                onConfirm,
                                                                                onDeny,
                                                                            }) => {
    const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState('');
    const [actualNewBalance, setActualNewBalance] = useState<number | null>(null);

    const handleConfirm = async () => {
        setStatus('processing');
        try {
            await onConfirm();

            // Get the updated balance after transfer
            // We'll set this from the parent component via a callback or context refresh
            const newBalance = senderBalance - (amount * 100);
            setActualNewBalance(newBalance);

            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Transfer failed');
        }
    };

    const handleDeny = () => {
        onDeny();
    };

    // Format numbers to always show 2 decimal places
    const formatAmount = (value: number | undefined | null) => {
        if (typeof value !== 'number' || isNaN(value)) return '0.00';
        return value.toFixed(2);
    };

    const formatBalance = (valueInCents: number | undefined | null) => {
        if (typeof valueInCents !== 'number' || isNaN(valueInCents)) return '0.00';
        return (valueInCents / 100).toFixed(2);
    };

    const predictedRemainingBalance = senderBalance - (amount * 100);
    const isInsufficientFunds = predictedRemainingBalance < 0;

    if (status === 'processing') {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto shadow-sm">
                <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing Transfer</h3>
                    <p className="text-sm text-gray-600 text-center">
                        Securely processing your €{formatAmount(amount)} transfer to {recipientName}...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        // Use actual balance if available, otherwise fall back to predicted
        const displayBalance = actualNewBalance !== null ? actualNewBalance : predictedRemainingBalance;

        return (
            <div className="bg-white rounded-lg border border-green-200 p-6 max-w-md mx-auto shadow-sm">
                <div className="flex flex-col items-center justify-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                    <h3 className="text-lg font-semibold text-green-700 mb-1">Transfer Successful!</h3>
                    <p className="text-sm text-gray-600 text-center mb-2">
                        €{formatAmount(amount)} has been sent to {recipientName}
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 mt-2">
                        New balance: €{formatBalance(displayBalance)}
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md mx-auto shadow-sm">
                <div className="flex flex-col items-center justify-center py-4">
                    <XCircle className="h-12 w-12 text-red-500 mb-3" />
                    <h3 className="text-lg font-semibold text-red-700 mb-1">Transfer Failed</h3>
                    <p className="text-sm text-gray-600 text-center mb-2">{errorMessage}</p>
                    <button
                        onClick={() => setStatus('pending')}
                        className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Transfer</h3>
            </div>

            {/* Amount Display */}
            <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">€{formatAmount(amount)}</div>
                <div className="text-sm text-gray-500">Transfer Amount</div>
            </div>

            {/* Recipient Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">Send to</div>
                        <div className="text-lg font-semibold text-gray-900">{recipientName}</div>
                        <div className="text-sm text-gray-500">{recipientEmail}</div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {description && (
                <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-2">
                        "{description}"
                    </div>
                </div>
            )}

            {/* Balance Info */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Account Balance</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current balance:</span>
                    <span className="font-medium text-gray-900">€{formatBalance(senderBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">After transfer:</span>
                    <span className={`font-medium ${isInsufficientFunds ? 'text-red-600' : 'text-gray-900'}`}>
                        €{formatBalance(predictedRemainingBalance)}
                    </span>
                </div>
            </div>

            {/* Insufficient Funds Warning */}
            {isInsufficientFunds && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Insufficient Funds</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                        You don't have enough balance to complete this transfer.
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={handleDeny}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isInsufficientFunds}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        isInsufficientFunds
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                >
                    {isInsufficientFunds ? 'Insufficient Funds' : 'Confirm & Send'}
                </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                🔒 This transfer will be processed securely and cannot be undone
            </div>
        </div>
    );
};

export default TransferConfirmationComponent;