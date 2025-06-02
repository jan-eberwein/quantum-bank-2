// components/UserCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getProfileImageUrl } from "@/lib/storage";
import { formatCardNumber } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

const UserCard: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-md animate-pulse">
        {/* placeholder while loading */}
      </div>
    );
  }

  const handleCardClick = () => {
    router.push("/settings");
  };

  return (
    <div
      className="p-4 bg-gray-100 rounded-lg shadow-md flex items-center gap-4 cursor-pointer"
      onClick={handleCardClick}
    >
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
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-gray-400">
          Card: {user.cardNumber ? formatCardNumber(user.cardNumber) : "—"}
        </p>
      </div>

      <div className="ml-auto">
        <LogoutButton stopCardClickPropagation />
      </div>
    </div>
  );
};

export default UserCard;
