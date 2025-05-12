// client/app/layout.tsx
import {ReactNode} from "react";
import {CopilotKit} from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import type {Metadata} from "next";
import {Inter, IBM_Plex_Serif} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"], variable: "--font-inter"});
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
        <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <CopilotKit runtimeUrl="/api/copilotkit">
            {children}
        </CopilotKit>
        </body>
        </html>
    );
}
