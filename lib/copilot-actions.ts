// lib/copilot-actions.ts
"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";

export function useCustomVoiceActions() {
  const router = useRouter();

  useCopilotAction({
    name: "navigateToPage",
    description: "Navigates to a specific page",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "The target page to navigate to (e.g., 'transactions', 'dashboard', 'settings')",
        required: true,
      },
    ],
    handler: async ({ page }: { page: string }) => {
      switch (page.toLowerCase()) {
        case "transactions":
        case "transaktionen":
          router.push("/transactions");
          break;
        case "settings":
        case "einstellungen":
          router.push("/settings");
          break;
        case "dashboard":
        case "start":
        case "home":
        case "übersicht":
          router.push("/");
          break;
        default:
          console.warn("Unrecognized page:", page);
          break;
      }
    },
  });

  useCopilotAction({
    name: "toggleSetting",
    description: "Toggles a user setting like dark mode or notifications",
    parameters: [
      {
        name: "setting",
        type: "string",
        description: "The setting to toggle (e.g., 'darkMode', 'notifications')",
        required: true,
      },
      {
        name: "value",
        type: "boolean",
        description: "New value (true to enable, false to disable)",
        required: true,
      },
    ],
    handler: async ({ setting, value }: { setting: string; value: boolean }) => {
      const event = new CustomEvent("copilot-setting-toggle", {
        detail: { setting, value },
      });
      window.dispatchEvent(event);
    },
  });
}
