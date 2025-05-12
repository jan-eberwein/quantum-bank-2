// client/api/transactionApi.ts
import apiService from '@/lib/apiService';

const DEMO_BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNDM1NjM1OSwiZXhwIjoxNzY1OTEzOTU5fQ.x3BJKqnC6St776IsqGrR20pEiWUFP-1CcVIx9Zl4ksY";

const transactionApi = {
    getTransactionsByAccountId: async (accountId: number) => {
        return apiService.get<TransactionApi[]>(`/transactions/involved/${accountId}`, DEMO_BEARER_TOKEN);
    },
};

export default transactionApi;
