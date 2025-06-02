// app/(root)/page.tsx
"use client";
import React from "react";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import LastTransactionsWidget from "@/components/LastTransactionsWidget";
import SimpleMoneyTransfer from "@/components/SimpleMoneyTransfer";
import { mockCategoriesData } from "@/constants/index";
import { useUser } from "@/context/UserContext";
import dynamic from "next/dynamic";
import { formatEuroCents } from "@/lib/format";

const Home = () => {
  const { user, loading } = useUser();

  // Dynamically load ChartsBox only on the client
  const ChartsBox = dynamic(
      () => import("@/components/ChartsBox"),
      { ssr: false, loading: () => <div>Loading charts…</div> }
  );

  // Keep the existing category data processing for charts
  const categorySpendingData = mockCategoriesData.map((item) => item.amount);
  const categoryLabels = mockCategoriesData.map((item) => item.category);

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
              {/* Replace the old mock transfer widget with the new real one */}
              <SimpleMoneyTransfer />
            </div>
          </div>

          <ChartsBox />
        </header>
      </div>
  );
};

export default Home;