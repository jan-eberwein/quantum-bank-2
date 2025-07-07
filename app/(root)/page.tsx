"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import LastTransactionsWidget from "@/components/LastTransactionsWidget";
import SimpleMoneyTransfer from "@/components/SimpleMoneyTransfer";
import { useUser } from "@/context/UserContext";
import useBalance from "@/hooks/useBalance";
import { formatEuroCents } from "@/lib/format";

// Dynamically load the real, data-driven ChartsBox on the client
const ChartsBox = dynamic(() => import("@/components/ChartsBox"), {
  ssr: false,
  loading: () => <div>Loading charts…</div>,
});

const Home: React.FC = () => {
  const { user, loading } = useUser();

  // Single refresh key that triggers both balance and transactions refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const { balance, loading: balanceLoading } = useBalance(user?.$id, refreshKey);

  const handleTransferComplete = () => {
    console.log('🔄 Manual transfer completed, refreshing dashboard...');
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const handleCopilotTransferComplete = (event: CustomEvent) => {
      console.log('🤖 Copilot transfer completed, refreshing dashboard...', event.detail);
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('copilot-transfer-complete', handleCopilotTransferComplete as EventListener);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('copilot-transfer-complete', handleCopilotTransferComplete as EventListener);
    };
  }, []);

  return (
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
              type="greeting"
              title="Welcome"
              user={user?.userId ?? "User"}
              subtext="Dashboard"
          />

          {loading || balanceLoading || !user ? (
              <p>Loading…</p>
          ) : (
              <TotalBalanceBox balance={balance / 100} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="lasttransactions h-full flex flex-col">
              <SimpleMoneyTransfer onTransferComplete={handleTransferComplete} />
            </div>
            <div className="totalbalancebox h-full flex flex-col justify-between">
              <LastTransactionsWidget refreshKey={refreshKey} />
            </div>
          </div>

          <ChartsBox refreshKey={refreshKey} />
        </header>
      </div>
  );
};

export default Home;