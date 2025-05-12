import ChartsBox from "@/components/ChartsBox";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import LastTransactionsWidget from "@/components/LastTransactionsWidget";
import React from "react";
import DynamicChart from "@/components/DynamicChart";
import { mockCategoriesData } from "@/constants/index"; // Import mock category data

const Home = () => {
  const loggedIn = { firstName: "Jan", lastName: "Eberwein" };

  // Prepare data for the category-wise spending chart
  const categorySpendingData = mockCategoriesData.map((item) => item.amount);
  const categoryLabels = mockCategoriesData.map((item) => item.category);

  return (
    <div className="home-content">
      <header className="home-header">
        <HeaderBox
          type="greeting"
          title="Welcome"
          user={loggedIn?.firstName || "User"}
          subtext="Dashboard"
        />
        <TotalBalanceBox balance={"10000.00"} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Adjusted container for consistent height */}
          <div className="lasttransactions h-full flex flex-col">
            <LastTransactionsWidget />
          </div>
          <div className="totalbalancebox h-full flex flex-col justify-between">
            <div className="incomechart">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart 1: Doughnut Chart */}
                <div className="chart-container">
                  <DynamicChart
                    type="doughnut"
                    data={categorySpendingData}
                    labels={categoryLabels}
                    title="Spending Breakdown (Doughnut)"
                  />
                </div>

                {/* Chart 2: Polar Area Chart */}
                <div className="chart-container">
                  <DynamicChart
                    type="polarArea"
                    data={categorySpendingData}
                    labels={categoryLabels}
                    title="Spending Breakdown (Polar Area)"
                  />
                </div>

                <br/>
                
              </div>
            </div>
          </div>
        </div>

        <ChartsBox />
      </header>
    </div>
  );
};

export default Home;
