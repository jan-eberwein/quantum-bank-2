"use client";

import React, { useState } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import HeaderBox from "@/components/HeaderBox";
import { FiCheckCircle, FiXCircle } from "react-icons/fi"; // Import icons for status indicators

const Page = () => {
    const [settings, setSettings] = useState({
        username: "Jan Eberwein",
        email: "jan@example.com",
        darkMode: false,
        notifications: {
            all: true,
            general: true,
            security: false,
            updates: true,
        },
    });

    // Handle toggles for all settings
    const handleToggle = (category: keyof typeof settings.notifications) => {
        if (category === "All Categories") {
            const newState = !settings.notifications.all;
            setSettings((prev) => ({
                ...prev,
                notifications: {
                    all: newState,
                    general: newState,
                    security: newState,
                    updates: newState,
                },
            }));
        } else {
            setSettings((prev) => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [category]: !prev.notifications[category],
                    all: Object.values({ ...prev.notifications, [category]: !prev.notifications[category] }).every(Boolean), // Auto-update "all"
                },
            }));
        }
    };

    // Handle account settings update
    const handleAccountToggle = (key: "darkMode") => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
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
            if (setting in settings.notifications) {
                handleToggle(setting as keyof typeof settings.notifications);
            } else if (setting === "darkMode") {
                handleAccountToggle(setting);
            }
            console.log(`Updated ${setting}:`, value);
        },
    });

    return (
        <div className="settings-page">
            <HeaderBox title="Settings" subtext="Manage your account and preferences" />

            <hr className="my-2 border-gray-300" />

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
                        <p className="text-sm text-gray-600">Toggle between light and dark mode.</p>
                    </div>
                    <button
                        onClick={() => handleAccountToggle("darkMode")}
                        className={`px-4 py-2 rounded-md text-white ${
                            settings.darkMode ? "bg-gray-800" : "bg-blue-500"
                        }`}
                    >
                        {settings.darkMode ? "Enabled" : "Disabled"}
                    </button>
                </div>
            </div>

            <hr className="my-2 border-gray-300" />

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
                            {value ? <FiCheckCircle className="text-green-500 text-xl" /> : <FiXCircle className="text-red-500 text-xl" />}
                            <span className="capitalize">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
