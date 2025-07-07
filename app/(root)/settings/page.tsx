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

    // Sync with CopilotKit
    useCopilotReadable({
        description: "User's account and notification settings",
        value: settings,
    });
    useCopilotReadable({
        description: "User profile information",
        value: { username, email },
    });

    useCopilotAction({
        name: "updateSettings",
        description: "Update user account or notification settings",
        parameters: [
            {
                name: "setting",
                type: "string",
                description:
                    "The setting key to update (darkMode, all/general/security/updates notifications)",
                required: true,
            },
            {
                name: "value",
                type: "boolean",
                description: "New value for the setting",
                required: true,
            },
        ],
        handler: async ({ setting, value }: { setting: string; value: boolean }) => {
            if (setting === "darkMode") {
                await handleDarkModeToggle();
            } else if (["all", "general", "security", "updates"].includes(setting)) {
                await handleNotificationToggle(
                    setting as keyof typeof settings.notifications
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

            {/*<hr className="border-gray-300" />*/}

            {/* Account Settings */}
            {/*<section className="space-y-4">
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
            </section>*/}

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
        </div>
    );
};

export default SettingsPage;
