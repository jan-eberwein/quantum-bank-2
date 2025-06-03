// lib/status-constants.ts
// Centralized status constants using environment variables

/**
 * Unified status IDs from the TransactionStatuses collection
 * These are used for both transactions and transfers
 */
export const STATUS_IDS = {
    PENDING: process.env.NEXT_PUBLIC_APPWRITE_PENDING_STATUS_ID!,
    COMPLETED: process.env.NEXT_PUBLIC_APPWRITE_COMPLETED_STATUS_ID!,
    REJECTED: process.env.NEXT_PUBLIC_APPWRITE_REJECTED_STATUS_ID!,
} as const;

/**
 * Status names for display purposes
 */
export const STATUS_NAMES = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
} as const;

/**
 * Helper function to get status ID by name
 */
export function getStatusIdByName(statusName: string): string | undefined {
    switch (statusName.toLowerCase()) {
        case 'pending':
            return STATUS_IDS.PENDING;
        case 'completed':
            return STATUS_IDS.COMPLETED;
        case 'rejected':
            return STATUS_IDS.REJECTED;
        default:
            return undefined;
    }
}

/**
 * Helper function to get status name by ID
 */
export function getStatusNameById(statusId: string): string {
    switch (statusId) {
        case STATUS_IDS.PENDING:
            return STATUS_NAMES.PENDING;
        case STATUS_IDS.COMPLETED:
            return STATUS_NAMES.COMPLETED;
        case STATUS_IDS.REJECTED:
            return STATUS_NAMES.REJECTED;
        default:
            return 'Unknown';
    }
}

/**
 * Check if a status ID is valid
 */
export function isValidStatusId(statusId: string): boolean {
    return Object.values(STATUS_IDS).includes(statusId as any);
}