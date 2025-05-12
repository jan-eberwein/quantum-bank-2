"use client";

import Sidebar from "@/components/Sidebar";
import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import CopilotChartHandler from "@/components/CopilotChartHandler";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = { firstName: "Jan", lastName: "Eberwein" };

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn} />
        <motion.div
          className="flex w-full"
          variants={animationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>

        <CopilotPopup
          instructions="You are assisting the user in their financial analysis. Generate charts when the user asks about account balance, income, or expenses."
          labels={{
            title: "Quantum Bank AI",
            initial: "Hi! 👋 How can I assist you today?",
          }}
          shortcut="/"
        />
      </main>
    </CopilotKit>
  );
}
