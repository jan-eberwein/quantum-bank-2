"use client";

import React, { useState } from "react";
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

  // 🔁 Called after successful transfer to refresh both balance and transactions
  const handleTransferComplete = () => {
    console.log("Dashboard: Transfer completed, refreshing data. Current refreshKey:", refreshKey);
    setRefreshKey((prev) => {
      const newKey = prev + 1;
      console.log("Dashboard: Setting new refreshKey:", newKey);
      return newKey;
    });
  };

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
              <>
                <TotalBalanceBox balance={balance / 100} />
                {console.log("Dashboard: Rendering TotalBalanceBox with balance:", balance / 100, "refreshKey:", refreshKey)}
              </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="lasttransactions h-full flex flex-col">
              <LastTransactionsWidget refreshKey={refreshKey} />
            </div>
            <div className="totalbalancebox h-full flex flex-col justify-between">
              <SimpleMoneyTransfer onTransferComplete={handleTransferComplete} />
            </div>
          </div>

          <ChartsBox />
        </header>
      </div>
  );
};

export default Home;