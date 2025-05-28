// components/UserCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { getProfileImageUrl } from "@/lib/storage";
import { formatCardNumber } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

const UserCard = () => {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg shadow-md animate-pulse">
                {/* placeholder while loading */}
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md flex items-center gap-4">
            <div className="relative w-12 h-12">
                <Image
                    src={
                        user.profileImageId
                            ? getProfileImageUrl(user.profileImageId)
                            : "/icons/user-icon.png"
                    }
                    alt="User Avatar"
                    fill
                    className="rounded-full object-cover"
                />
            </div>
            <div className="flex flex-col">
                <p className="text-base font-semibold text-gray-800">
                    {user.userId}
                </p>
                <p className="text-sm text-gray-500">
                    {user.email}
                </p>
                <p className="text-xs text-gray-400">
                    Card: {user.cardNumber ? formatCardNumber(user.cardNumber) : "—"}
                </p>
            </div>
            <div className="ml-auto">
                <LogoutButton />
            </div>
        </div>
    );
};

export default UserCard;
