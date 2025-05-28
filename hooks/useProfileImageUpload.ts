"use client";

import { useState, ChangeEvent } from "react";
import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useUser } from "@/context/UserContext";
import { updateUserDocument } from "@/lib/user";

// Make sure NEXT_PUBLIC_APPWRITE_STORAGE_ID is set
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!;

export function useProfileImageUpload() {
    const { user, refreshUser } = useUser();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadProfileImage = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user) return;
        const file = e.target.files[0];
        setIsUploading(true);
        setError(null);

        try {
            // 1) Upload to Appwrite storage
            const created = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                file
            );
            // 2) Persist fileId to user document
            await updateUserDocument(user.$id, { profileImageId: created.$id });
            // 3) Refresh context so UI updates
            await refreshUser();
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadProfileImage, isUploading, error };
}
