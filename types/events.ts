export interface CopilotEventDetail {
    [key: string]: any;
}

export interface CopilotUpdateSettingDetail {
    settingType: string;
    value: string;
    notificationType?: string;
}

export interface CopilotToggleSettingDetail {
    setting: string;
}

export interface CopilotFilterTransactionsDetail {
    searchTerm?: string;
    category?: string;
    status?: string;
    transactionType?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CopilotTransferDetail {
    amount?: string;
    recipientId?: string;
    description?: string;
}

// Extend the Window interface to include our custom events
declare global {
    interface WindowEventMap {
        'copilot-update-setting': CustomEvent<CopilotUpdateSettingDetail>;
        'copilot-toggle-setting': CustomEvent<CopilotToggleSettingDetail>;
        'copilot-get-account-info': CustomEvent<{}>;
        'copilot-check-balance': CustomEvent<{}>;
        'copilot-filter-transactions': CustomEvent<CopilotFilterTransactionsDetail>;
        'copilot-clear-filters': CustomEvent<{}>;
        'copilot-start-transfer': CustomEvent<CopilotTransferDetail>;
        'copilot-confirm-transfer': CustomEvent<{}>;
        'copilot-cancel-transfer': CustomEvent<{}>;
        'copilot-logout': CustomEvent<{}>;
    }
}

// Utility function to create typed event listeners
export function createEventListener<T extends keyof WindowEventMap>(
    eventType: T,
    handler: (event: WindowEventMap[T]) => void | Promise<void>
): EventListener {
    return handler as EventListener;
}