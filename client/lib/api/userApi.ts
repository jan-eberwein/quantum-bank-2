/*import { User } from "@/types"; // Adjust the path based on your project structure
import { ApiResponse } from "@/types";
import {saveUserToDB} from "@/lib/api/authApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch logged-in user data
export async function fetchLoggedInUser(token: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`, // Add the token to the request header
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch logged-in user data");
    }

    return response.json();
}

// Fetch all registered users
export async function fetchAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${BASE_URL}/users`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch all users");
    }

    return response.json();
}


export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: string;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        );

        return newUser;
    } catch (error) {
        console.log(error);
    }
}*/

import {ApiResponse, User} from "@/types";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch logged-in user data
export async function fetchLoggedInUser(token: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`, // Add the token to the request header
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch logged-in user data");
    }

    return response.json();
}