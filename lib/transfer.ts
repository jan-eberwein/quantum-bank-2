import { database, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function syncUserBalance(userId: string): Promise<number> {
  if (!userId) return 0;

  const txRes = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
    [Query.equal("userId", userId), Query.limit(1000)]
  );

  const newBalance = txRes.documents.reduce(
    (sum: number, tx: any) => sum + (tx.amount ?? 0),
    0
  );

  await database.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    userId,
    { balance: newBalance }
  );

  return newBalance;
}

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
  private static readonly PENDING_STATUS_ID =
    process.env.NEXT_PUBLIC_APPWRITE_PENDING_STATUS_ID!;
  private static readonly COMPLETED_STATUS_ID =
    process.env.NEXT_PUBLIC_APPWRITE_COMPLETED_STATUS_ID!;
  private static readonly REJECTED_STATUS_ID =
    process.env.NEXT_PUBLIC_APPWRITE_REJECTED_STATUS_ID!;

  static async executeTransfer(transferData: TransferData): Promise<TransferResult> {
    try {
      if (transferData.amount <= 0) {
        return { success: false, error: "Transfer amount must be greater than zero" };
      }

      if (transferData.senderUserId === transferData.receiverUserId) {
        return { success: false, error: "Cannot transfer money to yourself" };
      }

      // Check current up-to-date balance
      const liveSenderBalance = await syncUserBalance(transferData.senderUserId);
      if (liveSenderBalance < transferData.amount) {
        return {
          success: false,
          error: `Insufficient balance. Available: €${(liveSenderBalance / 100).toFixed(2)}, required: €${(transferData.amount / 100).toFixed(2)}`,
        };
      }

      // Fetch both users (needed for display info in transaction records)
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

      // Create transfer record (initial status: pending)
      const transfer = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID!,
        ID.unique(),
        {
          senderUserId: transferData.senderUserId,
          receiverUserId: transferData.receiverUserId,
          amount: transferData.amount,
          description: transferData.description.slice(0, 200),
          createdAt: new Date().toISOString(),
          transferStatusId: this.PENDING_STATUS_ID,
        }
      );

      // Insert 2 transactions (sender and receiver)
      const now = new Date().toISOString();
      const txCategoryId = process.env.NEXT_PUBLIC_APPWRITE_TRANSFER_CATEGORY_ID!;

      const senderTx = {
        userId: transferData.senderUserId,
        amount: -transferData.amount,
        createdAt: now,
        merchant: `Transfer to ${receiver.userId}`,
        description: transferData.description || "Money Transfer",
        transactionStatusId: this.COMPLETED_STATUS_ID,
        transactionCategoryId: txCategoryId,
      };

      const receiverTx = {
        userId: transferData.receiverUserId,
        amount: transferData.amount,
        createdAt: now,
        merchant: `Transfer from ${sender.userId}`,
        description: transferData.description || "Money Received",
        transactionStatusId: this.COMPLETED_STATUS_ID,
        transactionCategoryId: txCategoryId,
      };

      await Promise.all([
        database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
          ID.unique(),
          senderTx
        ),
        database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
          ID.unique(),
          receiverTx
        ),
      ]);

      // Re-sync both users' balances after new transactions were created
      await Promise.all([
        syncUserBalance(transferData.senderUserId),
        syncUserBalance(transferData.receiverUserId),
      ]);

      // Mark the transfer completed
      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID!,
        transfer.$id,
        { transferStatusId: this.COMPLETED_STATUS_ID }
      );

      return { success: true, transferId: transfer.$id };
    } catch (error: any) {
      console.error("Transfer error:", error);
      return {
        success: false,
        error: "Transfer failed. Please try again.",
      };
    }
  }
}
