"use client";

import React, {useEffect, useState} from "react";
import {useCopilotAction, useCopilotReadable} from "@copilotkit/react-core";
import HeaderBox from "@/components/HeaderBox";
import {FiCheckCircle, FiXCircle} from "react-icons/fi";
import {useUser} from "@/context/UserContext";
import {updateUserPreferences} from "@/lib/user"; // Import icons for status indicators

const Page = () => {
    const {user, loading, refreshUser} = useUser();
    const [settings, setSettings] = useState({
        username: "",
        email: "",
        darkMode: false,
        notifications: {
            all: false,
            general: false,
            security: false,
            updates: false,
        },
    });

    // Populate from real user once loaded
    useEffect(() => {
        if (!loading && user) {
            const general = user.generalNotificationsEnabled;
            const security = user.securityNotificationsEnabled;
            const updates = user.updateNotificationsEnabled;
            setSettings({
                username: user.userId,
                email: user.email,
                darkMode: user.darkModeEnabled,
                notifications: {
                    general,
                    security,
                    updates,
                    all: general && security && updates,
                },
            });
        }
    }, [loading, user]);


// Handle toggles for all settings
    const handleToggle = async (category: keyof typeof settings.notifications) => {
        // 1) compute new local state
        let newNotifications = {...settings.notifications};

        if (category === "all") {
            const newVal = !newNotifications.all;
            newNotifications = {
                all: newVal,
                general: newVal,
                security: newVal,
                updates: newVal,
            };
        } else {
            newNotifications = {
                ...newNotifications,
                [category]: !newNotifications[category],
                all: Object.values({
                    ...newNotifications,
                    [category]: !newNotifications[category],
                }).every((v) => v),
            };
        }

        // 2) update local UI
        setSettings((s) => ({
            ...s,
            notifications: newNotifications,
        }));

        // 3) persist to Appwrite
        if (!user) return;

        if (category === "all") {
            await updateUserPreferences(user.$id, {
                generalNotificationsEnabled: newNotifications.general,
                securityNotificationsEnabled: newNotifications.security,
                updateNotificationsEnabled: newNotifications.updates,
            });
        } else {
            // map our key to the actual Appwrite field
            const fieldMap = {
                general: "generalNotificationsEnabled",
                security: "securityNotificationsEnabled",
                updates: "updateNotificationsEnabled",
            } as const;
            const fieldName = fieldMap[category] as
                | "generalNotificationsEnabled"
                | "securityNotificationsEnabled"
                | "updateNotificationsEnabled";

            await updateUserPreferences(user.$id, {
                [fieldName]: newNotifications[category],
            });
        }

        // 4) refresh global user context
        await refreshUser();
    };


// Handle account settings update (dark mode)
    const handleAccountToggle = async () => {
        // 1) flip locally
        const newVal = !settings.darkMode;
        setSettings((s) => ({
            ...s,
            darkMode: newVal,
        }));

        // 2) persist to Appwrite
        if (!user) return;
        await updateUserPreferences(user.$id, {
            darkModeEnabled: newVal,
        });

        // 3) refresh global user context
        await refreshUser();
    };


    // Sync with CopilotKit
    useCopilotReadable({
        description: "User's account and notification settings",
        value: settings,
    });

// Define Copilot action for updates
    useCopilotAction({
        name: "updateSettings",
        description: "Update user account or notification settings",
        parameters: [
            {
                name: "setting",
                type: "string",
                description: "The setting key to update (e.g., darkMode, general, security, updates)",
                required: true,
            },
            {
                name: "value",
                type: "boolean",
                description: "The new value for the setting",
                required: true,
            },
        ],
        handler: async ({ setting, value }: { setting: string; value: boolean }) => {
            console.log(`Copilot wants to update ${setting} →`, value);

            if (setting === "darkMode") {
                // dark mode toggle
                await handleAccountToggle();
                console.log("Dark mode updated via Copilot");
            } else if (setting in settings.notifications) {
                // notification toggle (all, general, security, updates)
                await handleToggle(setting as keyof typeof settings.notifications);
                console.log(`Notification "${setting}" updated via Copilot`);
            } else {
                console.warn("Unsupported setting key:", setting);
            }
        },
    });


    return (
        <div className="settings-page">
            <HeaderBox title="Settings" subtext="Manage your account and preferences"/>

            <hr className="my-2 border-gray-300"/>

            {/* Account Settings */}
            <h3 className="text-2xl font-semibold">Account Settings</h3>
            <div className="mt-4 space-y-4">
                <div className="border p-4 rounded-md shadow-sm flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Username</h3>
                        <p className="text-sm text-gray-600">{settings.username}</p>
                    </div>
                </div>

                <div className="border p-4 rounded-md shadow-sm flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Email</h3>
                        <p className="text-sm text-gray-600">{settings.email}</p>
                    </div>
                </div>

                <div className="border p-4 rounded-md shadow-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-600">
                            Toggle between light and dark mode.
                        </p>
                    </div>
                    <button
                        onClick={handleAccountToggle}
                        className={`px-4 py-2 rounded-md text-white ${
                            settings.darkMode ? "bg-gray-800" : "bg-blue-500"
                        }`}
                    >
                        {settings.darkMode ? "Enabled" : "Disabled"}
                    </button>
                </div>

            </div>

            <hr className="my-2 border-gray-300"/>

            {/* Notifications */}
            <h3 className="text-2xl font-semibold">Notifications</h3>
            <div className="mt-4 space-y-4">
                {/* Toggle All */}
                <div className="border p-4 rounded-md shadow-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium">Enable All Notifications</h3>
                        <p className="text-sm text-gray-600">Turn on/off all notifications at once.</p>
                    </div>
                    <button
                        onClick={() => handleToggle("all")}
                        className={`px-4 py-2 rounded-md text-white ${
                            settings.notifications.all ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {settings.notifications.all ? "Enabled" : "Disabled"}
                    </button>
                </div>

                {/* Individual Notifications */}
                {["general", "security", "updates"].map((category) => (
                    <div key={category} className="border p-4 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium capitalize">{category} Notifications</h3>
                            <p className="text-sm text-gray-600">
                                {category === "general"
                                    ? "General updates and alerts."
                                    : category === "security"
                                        ? "Security alerts for your account."
                                        : "App feature updates and releases."}
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle(category as keyof typeof settings.notifications)}
                            className={`px-4 py-2 rounded-md text-white ${
                                settings.notifications[category as keyof typeof settings.notifications]
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            }`}
                        >
                            {settings.notifications[category as keyof typeof settings.notifications] ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Display current settings visually */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold">Current Notification Status:</h3>
                <div className="flex gap-4 mt-2">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                            {value ? <FiCheckCircle className="text-green-500 text-xl"/> :
                                <FiXCircle className="text-red-500 text-xl"/>}
                            <span className="capitalize">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
