'use client';

import Sidebar from "@/components/Sidebar";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import CopilotChartHandler from "@/components/CopilotChartHandler";
import { EnhancedCopilotPopup } from "@/components/EnhancedCopilotPopup";
import { motion } from "framer-motion";
import useUser from "@/hooks/useUser";
import ClientAuthCheck from "@/components/ClientAuthCheck"; // Import the auth check

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    const animationVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    return (
        <CopilotKit runtimeUrl="/api/copilotkit">
            {/* Wrap everything in ClientAuthCheck to enforce authentication */}
            <ClientAuthCheck>
                <main className="flex h-screen w-full font-inter">
                    <Sidebar user={user} />
                    <motion.div
                        className="flex w-full"
                        variants={animationVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {children}
                    </motion.div>

                    {/* Use the enhanced CopilotPopup with money transfer integration */}
                    <EnhancedCopilotPopup />

                    {/* Keep the chart handler for data visualization */}
                    <CopilotChartHandler />
                </main>
            </ClientAuthCheck>
        </CopilotKit>
    );
}