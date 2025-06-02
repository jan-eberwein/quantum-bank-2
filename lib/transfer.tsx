// lib/transfer.ts
import { database, ID } from '@/lib/appwrite';

export interface TransferData {
    senderUserId: string;
    receiverUserId: string;
    amount: number; // in cents
    description: string;
}

export interface TransferResult {
    success: boolean;
    error?: string;
    transferId?: string;
}

export class TransferService {
    // Get transfer status IDs (you'll need to add these to your .env.local)
    private static readonly PENDING_STATUS_ID = process.env.NEXT_PUBLIC_APPWRITE_PENDING_STATUS_ID!;
    private static readonly COMPLETED_STATUS_ID = process.env.NEXT_PUBLIC_APPWRITE_COMPLETED_STATUS_ID!;

    static async executeTransfer(transferData: TransferData): Promise<TransferResult> {
        try {
            // 1. Basic validation
            if (transferData.amount <= 0) {
                return { success: false, error: 'Transfer amount must be greater than zero' };
            }

            if (transferData.senderUserId === transferData.receiverUserId) {
                return { success: false, error: 'Cannot transfer money to yourself' };
            }

            // 2. Get sender and receiver data
            const [sender, receiver] = await Promise.all([
                database.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                    transferData.senderUserId
                ),
                database.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                    transferData.receiverUserId
                )
            ]);

            // 3. Check if sender has sufficient balance
            if (sender.balance < transferData.amount) {
                return {
                    success: false,
                    error: `Insufficient balance. Available: €${sender.balance / 100}, Required: €${transferData.amount / 100}`
                };
            }

            // 4. Create transfer record
            const transfer = await database.createDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID!,
                ID.unique(),
                {
                    senderUserId: transferData.senderUserId,
                    receiverUserId: transferData.receiverUserId,
                    amount: transferData.amount,
                    description: transferData.description.slice(0, 200), // Limit description length
                    createdAt: new Date().toISOString(),
                    transferStatusId: this.PENDING_STATUS_ID
                }
            );

            // 5. Update balances
            await Promise.all([
                // Deduct from sender
                database.updateDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                    transferData.senderUserId,
                    { balance: sender.balance - transferData.amount }
                ),
                // Add to receiver
                database.updateDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                    transferData.receiverUserId,
                    { balance: receiver.balance + transferData.amount }
                )
            ]);

            // 6. Create transaction records for both users
            const senderTransaction = {
                userId: transferData.senderUserId,
                amount: -transferData.amount, // Negative for outgoing
                createdAt: new Date().toISOString(),
                merchant: `Transfer to ${receiver.userId}`,
                description: transferData.description || 'Money Transfer',
                transactionStatusId: this.COMPLETED_STATUS_ID,
                transactionCategoryId: process.env.NEXT_PUBLIC_APPWRITE_TRANSFER_CATEGORY_ID!
            };

            const receiverTransaction = {
                userId: transferData.receiverUserId,
                amount: transferData.amount, // Positive for incoming
                createdAt: new Date().toISOString(),
                merchant: `Transfer from ${sender.userId}`,
                description: transferData.description || 'Money Received',
                transactionStatusId: this.COMPLETED_STATUS_ID,
                transactionCategoryId: process.env.NEXT_PUBLIC_APPWRITE_TRANSFER_CATEGORY_ID!
            };

            await Promise.all([
                database.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
                    ID.unique(),
                    senderTransaction
                ),
                database.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
                    ID.unique(),
                    receiverTransaction
                )
            ]);

            // 7. Update transfer status to completed
            await database.updateDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID!,
                transfer.$id,
                { transferStatusId: this.COMPLETED_STATUS_ID }
            );

            return { success: true, transferId: transfer.$id };

        } catch (error: any) {
            console.error('Transfer error:', error);
            return { success: false, error: 'Transfer failed. Please try again.' };
        }
    }
}