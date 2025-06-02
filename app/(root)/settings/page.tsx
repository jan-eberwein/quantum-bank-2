"use client";

import React, { useEffect, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import { useUser } from "@/context/UserContext";
import { updateUserPreferences, updateUserProfile } from "@/lib/user";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

// Type definitions for custom events
interface CopilotUpdateSettingDetail {
    settingType: string;
    value: string;
    notificationType?: string;
}

interface CopilotToggleSettingDetail {
    setting: string;
}

// Enhanced utility functions for different event handler types
function createEventListener<T>(
    handler: (event: CustomEvent<T>) => void | Promise<void>
): EventListener {
    return (event: Event) => handler(event as CustomEvent<T>);
}

function createSimpleEventListener(
    handler: () => void | Promise<void>
): EventListener {
    return () => handler();
}

const SettingsPage = () => {
    const { user, loading, refreshUser } = useUser();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [settings, setSettings] = useState({
        darkMode: false,
        notifications: {
            all: false,
            general: false,
            security: false,
            updates: false,
        },
    });
    const [toggling, setToggling] = useState<{ [k: string]: boolean }>({});

    // Initialize profile + settings state
    useEffect(() => {
        if (!loading && user) {
            setUsername(user.userId);
            setEmail(user.email);
            setSettings({
                darkMode: user.darkModeEnabled,
                notifications: {
                    general: user.generalNotificationsEnabled,
                    security: user.securityNotificationsEnabled,
                    updates: user.updateNotificationsEnabled,
                    all:
                        user.generalNotificationsEnabled &&
                        user.securityNotificationsEnabled &&
                        user.updateNotificationsEnabled,
                },
            });
        }
    }, [loading, user]);

    // Make settings readable by Copilot
    useCopilotReadable({
        description: "Current user account settings and preferences",
        value: {
            username,
            email,
            balance: user?.balance ? user.balance / 100 : 0,
            cardNumber: user?.cardNumber,
            darkMode: settings.darkMode,
            notifications: settings.notifications,
            profileImageId: user?.profileImageId,
        },
    });

    useCopilotReadable({
        description: "Available notification settings that can be toggled",
        value: {
            availableNotificationTypes: ['all', 'general', 'security', 'updates'],
            currentNotificationStatus: settings.notifications,
        },
    });

    // Save username + email
    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            await updateUserProfile(user.$id, { userId: username, email });
            await refreshUser(true);
        } catch (err) {
            console.error("Failed to update profile:", err);
        } finally {
            setSavingProfile(false);
        }
    };

    // Toggle dark mode
    const handleDarkModeToggle = async () => {
        if (!user) return;
        const newVal = !settings.darkMode;
        setSettings((s) => ({ ...s, darkMode: newVal }));
        setToggling((t) => ({ ...t, darkMode: true }));
        try {
            await updateUserPreferences(user.$id, { darkModeEnabled: newVal });
            await refreshUser(true);
        } catch (err) {
            console.error(err);
        } finally {
            setToggling((t) => ({ ...t, darkMode: false }));
        }
    };

    // Toggle notifications
    const handleNotificationToggle = async (
        key: keyof typeof settings.notifications
    ) => {
        if (!user) return;
        // prepare new notifications object
        let next = { ...settings.notifications };
        if (key === "all") {
            const newAll = !next.all;
            next = { all: newAll, general: newAll, security: newAll, updates: newAll };
        } else {
            next[key] = !next[key];
            next.all =
                next.general && next.security && next.updates;
        }
        setSettings((s) => ({ ...s, notifications: next }));
        setToggling((t) => ({ ...t, [key]: true }));

        // map keys to user doc fields
        const fieldMap = {
            general: "generalNotificationsEnabled",
            security: "securityNotificationsEnabled",
            updates: "updateNotificationsEnabled",
        } as const;

        try {
            if (key === "all") {
                await updateUserPreferences(user.$id, {
                    generalNotificationsEnabled: next.general,
                    securityNotificationsEnabled: next.security,
                    updateNotificationsEnabled: next.updates,
                });
            } else {
                const fieldName = fieldMap[key];
                await updateUserPreferences(user.$id, {
                    [fieldName]: next[key],
                });
            }
            await refreshUser(true);
        } catch (err) {
            console.error(err);
        } finally {
            setToggling((t) => ({ ...t, [key]: false }));
        }
    };

    // CopilotKit Actions
    useCopilotAction({
        name: "updateUsername",
        description: "Update the user's username/display name",
        parameters: [
            {
                name: "newUsername",
                type: "string",
                description: "New username to set",
                required: true,
            },
        ],
        handler: async ({ newUsername }) => {
            setUsername(newUsername);
        },
    });

    useCopilotAction({
        name: "updateEmail",
        description: "Update the user's email address",
        parameters: [
            {
                name: "newEmail",
                type: "string",
                description: "New email address to set",
                required: true,
            },
        ],
        handler: async ({ newEmail }) => {
            setEmail(newEmail);
        },
    });

    useCopilotAction({
        name: "saveProfileChanges",
        description: "Save changes to username and email",
        handler: async () => {
            await handleSaveProfile();
        },
    });

    useCopilotAction({
        name: "toggleDarkMode",
        description: "Toggle dark mode on or off",
        parameters: [
            {
                name: "enable",
                type: "string",
                description: "Whether to enable ('true') or disable ('false') dark mode. If not specified, will toggle current state.",
                required: false,
            },
        ],
        handler: async ({ enable }) => {
            if (enable !== undefined) {
                const shouldEnable = enable.toLowerCase() === 'true';
                if (shouldEnable !== settings.darkMode) {
                    await handleDarkModeToggle();
                }
            } else {
                await handleDarkModeToggle();
            }
        },
    });

    useCopilotAction({
        name: "toggleNotifications",
        description: "Toggle specific notification settings",
        parameters: [
            {
                name: "type",
                type: "string",
                description: "Notification type: 'all', 'general', 'security', 'updates'",
                required: true,
            },
            {
                name: "enable",
                type: "string",
                description: "Whether to enable ('true') or disable ('false'). If not specified, will toggle current state.",
                required: false,
            },
        ],
        handler: async ({ type, enable }) => {
            const notificationType = type.toLowerCase() as keyof typeof settings.notifications;

            if (!['all', 'general', 'security', 'updates'].includes(notificationType)) {
                console.error("Invalid notification type:", type);
                return;
            }

            if (enable !== undefined) {
                const shouldEnable = enable.toLowerCase() === 'true';
                if (shouldEnable !== settings.notifications[notificationType]) {
                    await handleNotificationToggle(notificationType);
                }
            } else {
                await handleNotificationToggle(notificationType);
            }
        },
    });

    useCopilotAction({
        name: "enableAllNotifications",
        description: "Enable all notification types",
        handler: async () => {
            if (!settings.notifications.all) {
                await handleNotificationToggle("all");
            }
        },
    });

    useCopilotAction({
        name: "disableAllNotifications",
        description: "Disable all notification types",
        handler: async () => {
            if (settings.notifications.all) {
                await handleNotificationToggle("all");
            }
        },
    });

    useCopilotAction({
        name: "getAccountBalance",
        description: "Get the current account balance",
        handler: async () => {
            const balance = user?.balance ? user.balance / 100 : 0;
            return `Current balance: €${balance.toFixed(2)}`;
        },
    });

    useCopilotAction({
        name: "getAccountSettings",
        description: "Get all current account settings and preferences",
        handler: async () => {
            return {
                username,
                email,
                balance: user?.balance ? user.balance / 100 : 0,
                darkMode: settings.darkMode,
                notifications: settings.notifications,
                cardNumber: user?.cardNumber,
            };
        },
    });

    useCopilotAction({
        name: "resetProfileToDefaults",
        description: "Reset profile settings to original values",
        handler: async () => {
            if (user) {
                setUsername(user.userId);
                setEmail(user.email);
            }
        },
    });

    // Fixed event listeners with proper typing using Solution 2
    useEffect(() => {
        const handleUpdateSetting = createEventListener<CopilotUpdateSettingDetail>(
            async (event) => {
                const { settingType, value, notificationType } = event.detail;

                switch (settingType) {
                    case 'darkmode':
                        const enableDark = value.toLowerCase() === 'true';
                        if (enableDark !== settings.darkMode) {
                            await handleDarkModeToggle();
                        }
                        break;

                    case 'notifications':
                        if (notificationType && ['all', 'general', 'security', 'updates'].includes(notificationType)) {
                            const enable = value.toLowerCase() === 'true';
                            const currentValue = settings.notifications[notificationType as keyof typeof settings.notifications];
                            if (enable !== currentValue) {
                                await handleNotificationToggle(notificationType as keyof typeof settings.notifications);
                            }
                        }
                        break;

                    case 'username':
                        setUsername(value);
                        break;

                    case 'email':
                        setEmail(value);
                        break;
                }
            }
        );

        const handleToggleSetting = createEventListener<CopilotToggleSettingDetail>(
            async (event) => {
                const { setting } = event.detail;

                switch (setting) {
                    case 'darkmode':
                        await handleDarkModeToggle();
                        break;
                    case 'notifications':
                    case 'generalnotifications':
                        await handleNotificationToggle('general');
                        break;
                    case 'securitynotifications':
                        await handleNotificationToggle('security');
                        break;
                    case 'updatenotifications':
                        await handleNotificationToggle('updates');
                        break;
                    case 'allnotifications':
                        await handleNotificationToggle('all');
                        break;
                }
            }
        );

        // Using Solution 2: createSimpleEventListener for handlers that don't need event data
        const handleGetAccountInfo = createSimpleEventListener(() => {
            const accountInfo = {
                username,
                email,
                balance: user?.balance ? user.balance / 100 : 0,
                darkMode: settings.darkMode,
                notifications: settings.notifications,
                cardNumber: user?.cardNumber,
            };
            console.log("Account Info:", accountInfo);
            return accountInfo;
        });

        const handleCheckBalance = createSimpleEventListener(() => {
            const balance = user?.balance ? user.balance / 100 : 0;
            console.log(`Current balance: €${balance.toFixed(2)}`);
            return balance;
        });

        // Event listener registration
        window.addEventListener('copilot-update-setting', handleUpdateSetting);
        window.addEventListener('copilot-toggle-setting', handleToggleSetting);
        window.addEventListener('copilot-get-account-info', handleGetAccountInfo);
        window.addEventListener('copilot-check-balance', handleCheckBalance);

        return () => {
            window.removeEventListener('copilot-update-setting', handleUpdateSetting);
            window.removeEventListener('copilot-toggle-setting', handleToggleSetting);
            window.removeEventListener('copilot-get-account-info', handleGetAccountInfo);
            window.removeEventListener('copilot-check-balance', handleCheckBalance);
        };
    }, [settings, username, email, user, handleDarkModeToggle, handleNotificationToggle]);

    if (loading || !user) {
        return <p>Loading settings…</p>;
    }

    return (
        <div className="settings-page space-y-8 p-8 bg-gray-25">
            <HeaderBox title="Settings" subtext="Manage your account and preferences" />

            {/* Profile Picture */}
            <section>
                <h3 className="text-2xl font-semibold mb-2">Profile Picture</h3>
                <ProfileImageUploader />
            </section>

            <hr className="border-gray-300" />

            {/* Username & Email */}
            <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Account Information</h3>
                <div className="max-w-md space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        {savingProfile ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </section>

            <hr className="border-gray-300" />

            {/* Account Settings */}
            <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Account Settings</h3>
                <div className="border p-4 rounded-md flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-medium">Dark Mode</h4>
                        <p className="text-sm text-gray-600">Toggle light/dark theme</p>
                    </div>
                    <button
                        onClick={handleDarkModeToggle}
                        disabled={toggling.darkMode}
                        className={`px-4 py-2 rounded-md text-white ${
                            settings.darkMode ? "bg-gray-800" : "bg-blue-500"
                        }`}
                    >
                        {settings.darkMode ? "Enabled" : "Disabled"}
                    </button>
                </div>
            </section>

            <hr className="border-gray-300" />

            {/* Notifications */}
            <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Notifications</h3>

                {/* Enable All */}
                <div className="border p-4 rounded-md flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-medium">Enable All Notifications</h4>
                        <p className="text-sm text-gray-600">Turn on/off all notifications</p>
                    </div>
                    <button
                        onClick={() => handleNotificationToggle("all")}
                        disabled={toggling.all}
                        className={`px-4 py-2 rounded-md text-white ${
                            settings.notifications.all ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {settings.notifications.all ? "Enabled" : "Disabled"}
                    </button>
                </div>

                {/* Individual */}
                {(["general", "security", "updates"] as const).map((cat) => (
                    <div
                        key={cat}
                        className="border p-4 rounded-md flex justify-between items-center"
                    >
                        <div>
                            <h4 className="text-lg font-medium capitalize">
                                {cat} Notifications
                            </h4>
                            <p className="text-sm text-gray-600">
                                {cat === "general"
                                    ? "General updates and alerts."
                                    : cat === "security"
                                        ? "Security alerts for your account."
                                        : "App feature updates and releases."}
                            </p>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle(cat)}
                            disabled={toggling[cat]}
                            className={`px-4 py-2 rounded-md text-white ${
                                settings.notifications[cat] ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                            {settings.notifications[cat] ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                ))}
            </section>

            <hr className="border-gray-300" />

            {/* Current Status Display */}
            <section>
                <h3 className="text-lg font-semibold mb-2">
                    Current Notification Status
                </h3>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(settings.notifications).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                            {val ? (
                                <FiCheckCircle className="text-green-500" />
                            ) : (
                                <FiXCircle className="text-red-500" />
                            )}
                            <span className="capitalize">{key}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Account Summary */}
            <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Account Summary</h3>
                <div className="bg-white p-4 rounded-md border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-xl font-bold text-green-600">
                                €{user.balance ? (user.balance / 100).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Card Number</p>
                            <p className="text-lg font-mono">
                                {user.cardNumber ? user.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim() : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Account ID</p>
                            <p className="text-sm font-mono text-gray-800">{user.$id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Theme</p>
                            <p className="text-sm">{settings.darkMode ? "Dark Mode" : "Light Mode"}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;