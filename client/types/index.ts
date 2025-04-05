// Types for Users table
export interface User {
    userId: number; // Primary key
    username: string;
    email: string;
    createdAt: string; // ISO 8601 format timestamp
    updatedAt?: string; // Nullable ISO 8601 format timestamp
}

// Types for AI_Commands table
export interface AICommand {
    commandId: number; // Primary key
    userId: number; // Foreign key referencing User
    commandText: string;
    intent?: string; // Nullable
    processedResult?: string; // Nullable
    createdAt: string; // ISO 8601 format timestamp
}

// Types for Accounts table
export interface Account {
    accountId: number; // Primary key
    ownerId: number; // Foreign key referencing User
    balance: number;
}

// Types for Transaction_Categories table
export interface TransactionCategory {
    categoryId: number; // Primary key
    categoryName: string;
}

// Types for Transaction_Statuses table
export interface TransactionStatus {
    statusId: number; // Primary key
    statusName: string;
}

// Types for Transactions table
export interface Transaction {
    transactionId: number; // Primary key
    senderAccountId: number; // Foreign key referencing Account
    recipientAccountId: number; // Foreign key referencing Account
    amount: number;
    statusId: number; // Foreign key referencing TransactionStatus
    categoryId?: number; // Foreign key referencing TransactionCategory, nullable
    description: string;
    transactionDate: string; // ISO 8601 format timestamp
}

// Utility Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string; // Optional error or success message
}
