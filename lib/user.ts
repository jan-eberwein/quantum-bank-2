import { account, database } from "@/lib/appwrite";
import { UserProfile } from "@/types/User";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        // ✅ First check if user is authenticated
        const current = await account.get();

        if (!current || !current.email) {
            return null;
        }

        // ✅ Then fetch user document from database
        const userDocs = await database.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal("email", current.email)]
        );

        if (!userDocs.documents.length) {
            return null;
        }

        const doc = userDocs.documents[0];
        return {
            $id: doc.$id,
            userId: doc.userId ?? "",
            email: doc.email ?? current.email,
            profileImageId: doc.profileImageId ?? null,
            balance: doc.balance ?? 0,
            cardNumber: doc.cardNumber ?? "",
            darkModeEnabled: doc.darkModeEnabled ?? false,
            generalNotificationsEnabled: doc.generalNotificationsEnabled ?? false,
            securityNotificationsEnabled: doc.securityNotificationsEnabled ?? false,
            updateNotificationsEnabled: doc.updateNotificationsEnabled ?? false,
        };
    } catch (err: any) {
        // ✅ Handle authentication errors silently - these are expected on auth pages
        if (err.code === 401 ||
            err.message?.includes('missing scope') ||
            err.message?.includes('guests') ||
            err.message?.includes('Unauthorized')) {
            // Don't log or throw - just return null for unauthenticated users
            return null;
        }

        // For other unexpected errors, still throw but with a cleaner message
        console.error("Unexpected error in getCurrentUserProfile:", err);
        throw new Error("Failed to fetch user profile");
    }
}

/**
 * Update one or more fields on the user document (username, email, or profileImageId).
 */
export async function updateUserProfile(
    documentId: string,
    data: Partial<Pick<UserProfile, "userId" | "email" | "profileImageId">>
): Promise<void> {
    await database.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        data
    );
}

export async function updateUserPreferences(
    documentId: string,
    data: Partial<Pick<
        UserProfile,
        | "darkModeEnabled"
        | "generalNotificationsEnabled"
        | "securityNotificationsEnabled"
        | "updateNotificationsEnabled"
    >>
): Promise<void> {
    await database.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        data
    );
}

export async function updateUserDocument(
    documentId: string,
    data: Partial<UserProfile>
): Promise<void> {
    await database.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        data
    );
}