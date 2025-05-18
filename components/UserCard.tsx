"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { getProfileImageUrl } from "@/lib/storage";
import { getCurrentUserProfile } from "@/lib/user";
import { UserProfile } from "@/types/User";
import {formatCardNumber} from "@/lib/utils";

const UserCard = () => {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function loadUser() {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        }

        loadUser();
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md flex items-center gap-4">
            {/* Avatar - Always Visible */}
            <div className="relative w-12 h-12">
                <Image
                    src={
                        user?.profileImageId
                            ? getProfileImageUrl(user.profileImageId)
                            : "/icons/user-icon.png"
                    }
                    alt="User Avatar"
                    fill
                    className="rounded-full object-cover"
                />
            </div>

            {/* User Info - Hidden on screens below 1024px */}
            <div className="user-info hidden lg:flex flex-col">
                <div className="user-info hidden lg:flex flex-col">
                    <p className="text-base font-semibold text-gray-800">
                        {user?.userId || "Loading..."}
                    </p>
                    <p className="text-sm text-gray-500">
                        {user?.cardNumber ? formatCardNumber(user.cardNumber) : "No Card"}
                    </p>
                </div>
            </div>

            <LogoutButton/>

            {/* Logout Button - Hidden on screens below 1024px */}
            {/*
      <div className="logout-button hidden lg:block ml-auto">
        <Link href="/sign-in">
          <Image
            src={"/icons/logout.svg"}
            alt="Logout Icon"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </Link>
      </div>
      */}
        </div>
    );
};

export default UserCard;
