// app/(root)/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import LastTransactionsWidget from "@/components/LastTransactionsWidget";
import SimpleMoneyTransfer from "@/components/SimpleMoneyTransfer";
import { useUser } from "@/context/UserContext";
import { formatEuroCents } from "@/lib/format";

// Dynamically load the real, data-driven ChartsBox on the client
const ChartsBox = dynamic(
  () => import("@/components/ChartsBox"),
  { ssr: false, loading: () => <div>Loading charts…</div> }
);

const Home: React.FC = () => {
  const { user, loading } = useUser();

  return (
    <div className="home-content">
      <header className="home-header">
        <HeaderBox
          type="greeting"
          title="Welcome"
          user={user?.userId ?? "User"}
          subtext="Dashboard"
        />

        {loading || user == null ? (
          <p>Loading…</p>
        ) : (
          <TotalBalanceBox balance={user.balance / 100} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="lasttransactions h-full flex flex-col">
            <LastTransactionsWidget />
          </div>
          <div className="totalbalancebox h-full flex flex-col justify-between">
            <SimpleMoneyTransfer />
          </div>
        </div>

        {/* ChartsBox now pulls live data instead of mocks */}
        <ChartsBox />
      </header>
    </div>
  );
};

export default Home;
