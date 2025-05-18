import { account, database } from "@/lib/appwrite";
import { UserProfile } from "@/types/User";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        const current = await account.get();

        const userDocs = await database.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal("email", current.email)]
        );

        if (!userDocs.documents.length) return null;

        const doc = userDocs.documents[0];

        const user: UserProfile = {
            $id: doc.$id,
            userId: doc.userId ?? "", // fallback for safety
            email: doc.email ?? current.email,
            profileImageId: doc.profileImageId ?? null,
            balance: doc.balance ?? 0,
            cardNumber: doc.cardNumber ?? "",
        };

        return user;
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return null;
    }
}
