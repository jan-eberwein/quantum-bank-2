"use client"
import React from "react";
import AnimatedCounter from "./AnimatedCounter";
import DoughnutChart from "./DoughnutChart";
import {useCopilotReadable} from "@copilotkit/react-core";

const TotalBalanceBox = ({balance}: TotalBalanceBoxProps) => {
    useCopilotReadable({
        description: "The current total balance in the users account in euro.",
        value: balance,
    });

    return (
        <section className="total-balance">
            <div className="total-balance-chart">
                <DoughnutChart/>
            </div>
            <p className="total-balance-label">Total Balance</p>
            <div className="total-balance-amount">
                <div className="flex flex-col gap-6">
                    <AnimatedCounter amount={balance}/>
                </div>
            </div>
            
        </section>
    );
};

export default TotalBalanceBox;
