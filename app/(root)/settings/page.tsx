"use client";

import React, { useEffect, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import { useUser } from "@/context/UserContext";
import { updateUserPreferences, updateUserProfile } from "@/lib/user";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

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

    const handleDarkModeToggle = async (newValue?: boolean) => {
        if (!user) return;
        const finalValue = newValue !== undefined ? newValue : !settings.darkMode;
        setSettings((s) => ({ ...s, darkMode: finalValue }));
        setToggling((t) => ({ ...t, darkMode: true }));
        try {
            await updateUserPreferences(user.$id, { darkModeEnabled: finalValue });
            await refreshUser(true);
        } catch (err) {
            console.error(err);
        } finally {
            setToggling((t) => ({ ...t, darkMode: false }));
        }
    };

    // --- FIX: Improved function to accept an explicit value ---
    const handleNotificationToggle = async (
        key: keyof typeof settings.notifications,
        newValue?: boolean
    ) => {
        if (!user) return;

        let next = { ...settings.notifications };
        const currentValue = settings.notifications[key];
        const finalValue = newValue !== undefined ? newValue : !currentValue;

        if (key === "all") {
            next = { all: finalValue, general: finalValue, security: finalValue, updates: finalValue };
        } else {
            next[key] = finalValue;
            next.all = next.general && next.security && next.updates;
        }
        setSettings((s) => ({ ...s, notifications: next }));
        setToggling((t) => ({ ...t, [key]: true }));

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
                const fieldName = fieldMap[key as keyof typeof fieldMap];
                if (fieldName) {
                    await updateUserPreferences(user.$id, { [fieldName]: next[key] });
                }
            }
            await refreshUser(true);
        } catch (err) {
            console.error(err);
        } finally {
            setToggling((t) => ({ ...t, [key]: false }));
        }
    };

    useCopilotReadable({
        description: "User's account and notification settings",
        value: settings,
    });
    useCopilotReadable({
        description: "User profile information",
        value: { username, email },
    });

    // --- FIX: Action now correctly passes the value to the handler ---
    useCopilotAction({
        name: "updateSettings",
        description: "Update user account or notification settings",
        parameters: [
            {
                name: "setting",
                type: "string",
                description: "The setting key to update (e.g., 'darkMode', 'all', 'security').",
                required: true,
            },
            {
                name: "value",
                type: "boolean",
                description: "New value for the setting (true for on, false for off).",
                required: true,
            },
        ],
        handler: async ({ setting, value }: { setting: string; value: boolean }) => {
            if (setting === "darkMode") {
                await handleDarkModeToggle(value);
            } else if (["all", "general", "security", "updates"].includes(setting)) {
                await handleNotificationToggle(
                    setting as keyof typeof settings.notifications,
                    value
                );
            } else {
                console.warn("Unsupported setting key:", setting);
            }
        },
    });

    if (loading || !user) {
        return <p>Loading settings…</p>;
    }

    return (
        <div className="settings-page space-y-8 p-8 bg-gray-25">
            <HeaderBox title="Settings" subtext="Manage your account and preferences" />

            <section>
                <h3 className="text-2xl font-semibold mb-2">Profile Picture</h3>
                <ProfileImageUploader />
            </section>

            <hr className="border-gray-300" />

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

            <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Notifications</h3>

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
        </div>
    );
};

export default SettingsPage;