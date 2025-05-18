"use client";
import React, { useState } from "react";
import ChartsBox from "@/components/ChartsBox";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import LastTransactionsWidget from "@/components/LastTransactionsWidget";
import { mockCategoriesData } from "@/constants/index";
import { useCustomVoiceActions } from "@/lib/copilot-actions";


const Home = () => {
  const loggedIn = { firstName: "Jan", lastName: "Eberwein" };

  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [customAccount, setCustomAccount] = useState("");
  const [step, setStep] = useState<"input" | "confirm">("input");

  // Example accounts
  const accounts = ["Jan Eberwein", ,"Johannes Eder", "Sophie Bachmayr",  "Custom"];

  const handleSend = () => {
    // Insert backend logic here
    alert(`Sent €${amount} to ${selectedAccount === "Custom" ? customAccount : selectedAccount}`);
    // Reset state
    setAmount("");
    setSelectedAccount("");
    setCustomAccount("");
    setStep("input");
  };

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
          <div className="lasttransactions h-full flex flex-col">
            <LastTransactionsWidget />
          </div>
          <div className="totalbalancebox h-full flex flex-col justify-between p-4 bg-white rounded-xl shadow-md">
            <div className="transferbox space-y-4">
              <h2 className="text-18 font-bold text-black">Send Money</h2>

              {step === "input" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (€)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 block w-full p-2 border rounded-md"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="mt-1 block w-full p-2 border rounded-md"
                    >
                      <option value="" disabled>Select account</option>
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedAccount === "Custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Account</label>
                      <input
                        type="text"
                        value={customAccount}
                        onChange={(e) => setCustomAccount(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                        placeholder="e.g. john@example.com or IBAN"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setStep("confirm")}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700"
                    disabled={!amount || !selectedAccount || (selectedAccount === "Custom" && !customAccount)}
                  >
                    Continue
                  </button>
                </>
              )}

              {step === "confirm" && (
                <div className="space-y-4">
                  <div className="text-gray-700">
                    <p>You're about to send:</p>
                    <p className="text-lg font-bold">€{amount}</p>
                    <p>To: {selectedAccount === "Custom" ? customAccount : selectedAccount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("input")}
                      className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700"
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <ChartsBox />
      </header>
    </div>
  );
};

export default Home;
