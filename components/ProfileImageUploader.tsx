"use client";

import React from "react";
import Image from "next/image";
import { getProfileImageUrl } from "@/lib/storage";
import { useUser } from "@/context/UserContext";
import { useProfileImageUpload } from "@/hooks/useProfileImageUpload";
import { Button } from "@/components/ui/button";

const ProfileImageUploader: React.FC = () => {
    const { user } = useUser();
    const { uploadProfileImage, isUploading, error } = useProfileImageUpload();

    const currentImageSrc = user?.profileImageId
        ? getProfileImageUrl(user.profileImageId)
        : "/icons/user-icon.png";

    return (
        <div className="border p-4 rounded-md shadow-sm flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <Image
                    src={currentImageSrc}
                    alt="Profile"
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1">
                <label>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadProfileImage}
                        disabled={isUploading}
                    />
                    <Button variant="outline" size="sm" asChild>
                        <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
                    </Button>
                </label>
                {error && (
                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProfileImageUploader;
