import {account, database} from "@/lib/appwrite";
import {ID, Permission, Role} from "appwrite";
import {generateCardNumber} from "@/lib/utils";

export async function signUpAndCreateProfile(userId: string, email: string, password: string) {
    await account.create(userId, email, password, userId);
    await account.createEmailPasswordSession(email, password);
    const current = await account.get();

    await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        ID.unique(),
        {
            userId: current.$id,
            email: current.email,
            profileImageId: null,
            balance: 0,
            cardNumber: generateCardNumber(),
            darkModeEnabled: false,
            generalNotificationsEnabled: true,
            securityNotificationsEnabled: true,
            updateNotificationsEnabled: true,
        },
        [
            Permission.read(Role.user(current.$id)),
            Permission.update(Role.user(current.$id)),
        ]
    );
}

export async function signIn(email: string, password: string) {
    try {
        const currentSession = await account.get();
        if (currentSession) {
            console.log("User already has an active session");
            return;
        }
    } catch (error) {
        // No current session, proceed with login
    }

    try {
        await account.createEmailPasswordSession(email, password);
    } catch (error: any) {
        if (error.message?.includes("session is active")) {
            console.log("Session already active, continuing...");
            return;
        }
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.warn('Logout error (ignored):', error);
    }
}