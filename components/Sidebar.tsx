// components/Sidebar.tsx
"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserCard from "./UserCard";
import { useCopilotReadable } from "@copilotkit/react-core";
import { format } from "date-fns";

// Dynamically import CopilotUI so it only renders on the client
const CopilotUI = dynamic(() => import("./CopilotUI"), { ssr: false });

interface SidebarProps {
  user: { [key: string]: any } | null;
}

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Make sidebar data readable by Copilot (non-action data only)
  useCopilotReadable({
    description: "The available pages/parts of the application",
    value: sidebarLinks,
  });

  useCopilotReadable({
    description: "The currently signed in user",
    value: user,
  });

  // Get the current date and format it as needed
  const currentDate = format(new Date(), "yyyy-MM-dd");

  // Make the current date readable by Copilot
  useCopilotReadable({
    description: "The current date in yyyy-MM-dd format",
    value: currentDate,
  });

  // ✅ Handle voice command events from CopilotUI
  useEffect(() => {
    const handleVoiceCommand = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, params } = customEvent.detail;

      try {
        switch (action) {
          case 'sendMoney':
            // Trigger the sendMoney action through the global action system
            const sendEvent = new CustomEvent('copilot-action', {
              detail: {
                action: 'sendMoney',
                args: params
              }
            });
            window.dispatchEvent(sendEvent);
            break;

          case 'checkBalance':
            const balanceEvent = new CustomEvent('copilot-action', {
              detail: {
                action: 'checkBalance',
                args: {}
              }
            });
            window.dispatchEvent(balanceEvent);
            break;

          case 'listRecipients':
            const recipientsEvent = new CustomEvent('copilot-action', {
              detail: {
                action: 'listRecipients',
                args: {}
              }
            });
            window.dispatchEvent(recipientsEvent);
            break;

          case 'navigateToPage':
            // Direct navigation for voice commands
            const { page } = params;
            switch (page.toLowerCase()) {
              case 'transactions':
              case 'transaction':
                router.push('/transactions');
                break;
              case 'settings':
              case 'setting':
                router.push('/settings');
                break;
              case 'dashboard':
              case 'home':
              case 'start':
                router.push('/');
                break;
            }
            break;

          case 'toggleSetting':
            const settingEvent = new CustomEvent('copilot-setting-toggle', {
              detail: params
            });
            window.dispatchEvent(settingEvent);
            break;
        }
      } catch (error) {
        console.error('Voice command execution error:', error);
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as (event: Event) => void);

    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as (event: Event) => void);
    };
  }, [router]);

  return (
      <section className="sidebar flex flex-col h-full">
        <nav className="flex flex-col gap-4">
          {/* Logo */}
          <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
            <div className="w-full max-w-[400px] mx-auto hidden sm:block lg:hidden">
              <Image
                  src="/icons/QuantumLogo_small.png"
                  layout="responsive"
                  width={16}
                  height={9}
                  alt="Quantum small logo"
                  className="sidebar-logo-tablet"
              />
            </div>
            <div className="w-full max-w-[400px] mx-auto hidden lg:block">
              <Image
                  src="/icons/QuantumLogo.png"
                  layout="responsive"
                  width={16}
                  height={9}
                  alt="Quantum logo"
                  className="sidebar-logo"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          {sidebarLinks.map((item) => {
            const isActive =
                pathname === item.route || pathname.startsWith(`${item.route}/`);

            return (
                <Link
                    href={item.route}
                    key={item.label}
                    className={cn(
                        "sidebar-link flex items-center gap-2 p-3 rounded-lg transition-colors",
                        { "bg-bank-gradient text-white": isActive }
                    )}
                >
                  <div className="relative size-6">
                    <Image
                        src={item.imgURL}
                        alt={item.label}
                        fill
                        className={cn("brightness-0", {
                          "brightness-[3] invert-0": isActive,
                        })}
                    />
                  </div>
                  <p
                      className={cn("sidebar-label text-gray-700", {
                        "!text-white": isActive,
                      })}
                  >
                    {item.label}
                  </p>
                </Link>
            );
          })}
        </nav>

        {/* Render CopilotUI only on the client - WITH VOICE COMMAND INTEGRATION */}
        <CopilotUI />

        <UserCard />
      </section>
  );
};

export default Sidebar;