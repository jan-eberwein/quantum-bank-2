import { ApiResponse } from "@/types"; // Adjust path to your ApiResponse type

// Base API URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Sign up a new user.
 * @param username - The user's chosen username.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise resolving to an ApiResponse containing a success message.
 */
/*export async function signup(
    username: string,
    email: string,
    password: string
): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    const result: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to sign up");
    }

    return result;
}*/

/**
 * Log in a user.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise resolving to an ApiResponse containing a token.
 */
export async function login(user: { email: string; password: string }): Promise<ApiResponse<{ token: string }>> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    const result: ApiResponse<{ token: string }> = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to log in");
    }

    return result;
}

/**
 * Log out the user by removing the session token.
 * @returns A promise resolving to void.
 */
export async function logout(): Promise<void> {
    try {
        // Remove the session token from local storage
        localStorage.removeItem("authToken");
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out the user:", error);
        throw new Error("Failed to sign out.");
    }
}
