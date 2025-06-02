// app/layout.tsx
import React, { ReactNode } from "react";
import "@copilotkit/react-ui/styles.css";
import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import CopilotProvider from "./CopilotProvider"; // Client-Wrapper importieren

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  title: "Quantum Bank",
  description: "AI-powered banking application",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable} flex h-screen`}>
        {/* 
          Sidebar und Content-Layout können hier angelagert werden (z. B. <Sidebar>).
          Der wichtigste Punkt: Wir umschließen den gesamten App-Content (children)
          mit unserem CopilotProvider, der die CopilotKit-Client-Only-Logik kapselt.
        */}
        <CopilotProvider>{children}</CopilotProvider>
      </body>
    </html>
  );
}
