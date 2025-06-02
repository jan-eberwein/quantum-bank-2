// components/Sidebar.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserCard from "./UserCard";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { TestShadcnChartCard } from "@/components/TestShadcnChartCard";
import CopilotChartHandler from "./CopilotChartHandler";
import { format } from "date-fns";
import LogoutButton from "./LogoutButton";

// Dynamically import CopilotUI so it only renders on the client
const CopilotUI = dynamic(() => import("./CopilotUI"), { ssr: false });

interface SidebarProps {
  user: { [key: string]: any } | null;
}

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

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

  // Define Copilot action
  useCopilotAction({
    name: "navigate",
    description: "Navigate to another route",
    parameters: [
      {
        name: "routeName",
        type: "string",
        description: "The route to navigate to",
        required: true,
      },
    ],
    handler: async ({ routeName }) => {
      if (!routeName || typeof routeName !== "string") {
        console.error("Invalid routeName provided");
        return;
      }
      try {
        await router.push(routeName);
      } catch (error) {
        console.error("Failed to navigate to the route:", error);
      }
    },
  });

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

      {/* Render CopilotUI only on the client */}
      <CopilotUI />

      <UserCard />
    </section>
  );
};

export default Sidebar;
