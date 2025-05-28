// components/ProfileImageUploader.tsx
"use client";

import React, { useState } from "react";
import { storage } from "@/lib/appwrite";
import { getProfileImageUrl } from "@/lib/storage";
import { BUCKET_ID } from "@/lib/appwrite"; // ensure you export your BUCKET_ID from lib/appwrite
import { useUser } from "@/context/UserContext";
import { updateUserProfile } from "@/lib/user";
import Image from "next/image";
import {ID} from "appwrite";

export default function ProfileImageUploader() {
    const { user, refreshUser } = useUser();
    const [uploading, setUploading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    if (!user) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        try {
            // upload to Appwrite storage
            const res = await storage.createFile(
                BUCKET_ID,
                ID.unique(),   // you’ll need `import { ID } from "appwrite"`
                file
            );

            // update user doc with new file id
            await updateUserProfile(user.$id, { profileImageId: res.$id });

            // refresh context / UI
            await refreshUser();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-4 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                {user.profileImageId || previewSrc ? (
                    <Image
                        src={previewSrc ?? getProfileImageUrl(user.profileImageId!)}
                        alt="Profile"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        No Photo
                    </div>
                )}
            </div>
            <label className="cursor-pointer text-sm font-medium text-blue-600 hover:underline">
                {uploading ? "Uploading…" : "Change Photo"}
                <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
