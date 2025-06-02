// app/CopilotProvider.tsx
"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";
import { UserProvider } from "@/context/UserContext";

// CopilotKit-Client-Only-Wrapper per dynamic import mit ssr: false
const CopilotKit = dynamic(
  () =>
    import("@copilotkit/react-core").then((mod) => {
      return mod.CopilotKit;
    }),
  { ssr: false }
);

interface CopilotProviderProps {
  children: ReactNode;
}

export default function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <UserProvider>{children}</UserProvider>
    </CopilotKit>
  );
}
