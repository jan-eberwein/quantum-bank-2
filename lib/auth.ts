import {account, database} from "@/lib/appwrite";
import {ID, Permission, Role} from "appwrite";
import {generateCardNumber} from "@/lib/utils";

export async function signUpAndCreateProfile(userId: string, email: string, password: string) {
    // 1. Create auth user
    await account.create(userId, email, password, userId);

    // 2. Log in immediately
    await account.createEmailPasswordSession(email, password);

    // 3. Get current session user
    const current = await account.get();

    // 4. Create corresponding user document
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
        // First, try to get current session to see if user is already logged in
        const currentSession = await account.get();
        if (currentSession) {
            // User is already logged in, just return
            console.log("User already has an active session");
            return;
        }
    } catch (error) {
        // No current session, proceed with login
    }

    try {
        // Create new session
        await account.createEmailPasswordSession(email, password);
    } catch (error: any) {
        if (error.message?.includes("session is active")) {
            // Session already exists, that's fine
            console.log("Session already active, continuing...");
            return;
        }
        // Re-throw other errors
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        // Delete current session
        await account.deleteSession('current');
    } catch (error) {
        console.warn('Logout error (ignored):', error);
    }
}