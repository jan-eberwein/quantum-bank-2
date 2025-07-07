/**
 * Transaction entity as stored in Appwrite database
 */
export interface Transaction {
    $id: string;                    // Appwrite document ID
    userId: string;                 // User who owns the transaction
    amount: number;                 // Amount in cents (integer)
    createdAt: string;              // ISO datetime string
    merchant: string;
    description?: string;
    transactionStatusId: string;
    transactionCategoryId: string;
    $createdAt?: string;           // Appwrite auto-generated creation timestamp
    $updatedAt?: string;           // Appwrite auto-generated update timestamp
}

/**
 * Unified Status entity - now used for both transactions and transfers
 * This replaces both TransactionStatus and TransferStatus
 */
export interface TransactionStatus {
    $id: string;        // Appwrite document ID
    name: string;
    $createdAt?: string;
    $updatedAt?: string;
}

/**
 * Transaction Category entity
 */
export interface TransactionCategory {
    $id: string;        // Appwrite document ID
    name: string;
    $createdAt?: string;
    $updatedAt?: string;
}

/**
 * Transfer entity (used only for backend operations, not UI display)
 * Transfers are displayed as transactions in the UI
 */
export interface Transfer {
    $id: string;
    senderUserId: string;
    receiverUserId: string;
    amount: number;                 // Amount in cents
    description: string;
    createdAt: string;
    transferStatusId: string;       // References unified TransactionStatuses
    $createdAt?: string;
    $updatedAt?: string;
}

/**
 * Enhanced transaction with resolved references for UI display
 */
export interface TransactionWithDetails extends Transaction {
    statusName: string;   // Resolved status name
    categoryName: string; // Resolved category name
}

/**
 * Transaction API response from external API (if still needed)
 */
export interface TransactionApi {
    transaction_id: number;
    sender_account_id: number;
    recipient_account_id: number;
    amount: number;
    description: string;
    transaction_date: string;
    category_name?: string;
    status_name?: string;
}

/**
 * Type guards for runtime type checking
 */
export const isTransaction = (obj: any): obj is Transaction => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.$id === 'string' &&
        typeof obj.userId === 'string' &&
        typeof obj.amount === 'number' &&
        typeof obj.createdAt === 'string' &&
        typeof obj.merchant === 'string' &&
        typeof obj.transactionStatusId === 'string' &&
        typeof obj.transactionCategoryId === 'string'
    );
};

export const isTransactionStatus = (obj: any): obj is TransactionStatus => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.$id === 'string' &&
        typeof obj.name === 'string'
    );
};

export const isTransactionCategory = (obj: any): obj is TransactionCategory => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.$id === 'string' &&
        typeof obj.name === 'string'
    );
};

export const isTransfer = (obj: any): obj is Transfer => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.$id === 'string' &&
        typeof obj.senderUserId === 'string' &&
        typeof obj.receiverUserId === 'string' &&
        typeof obj.amount === 'number' &&
        typeof obj.description === 'string' &&
        typeof obj.createdAt === 'string' &&
        typeof obj.transferStatusId === 'string'
    );
};