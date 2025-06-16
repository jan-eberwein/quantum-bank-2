"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import { TransferService, TransferData } from "@/lib/transfer";
import useBalance from "@/hooks/useBalance";

type Step = "input" | "confirm" | "processing" | "success" | "error";

interface SimpleMoneyTransferProps {
  onTransferComplete?: () => void;
}

interface TransferState {
  step: Step;
  amount: string;
  selectedUserId: string;
  description: string;
  error: string;
  transferId: string;
}

const SimpleMoneyTransfer: React.FC<SimpleMoneyTransferProps> = ({
  onTransferComplete,
}) => {
  const { user, refreshUser } = useUser();
  const { users, loading: usersLoading } = useAllUsers();
  const { balance: liveBalance, loading: balLoading } = useBalance(user?.$id);

  const [state, setState] = useState<TransferState>({
    step: "input",
    amount: "",
    selectedUserId: "",
    description: "",
    error: "",
    transferId: "",
  });

  const availableUsers = users.filter((u) => u.$id !== user?.$id);

  const resetForm = () => {
    setState({
      step: "input",
      amount: "",
      selectedUserId: "",
      description: "",
      error: "",
      transferId: "",
    });
  };

  const handleContinue = () => {
    const amount = parseFloat(state.amount);
    if (!amount || amount <= 0) {
      setState((prev) => ({ ...prev, error: "Please enter a valid amount" }));
      return;
    }

    if (!state.selectedUserId) {
      setState((prev) => ({ ...prev, error: "Please select a recipient" }));
      return;
    }

    if (!user || balLoading) {
      setState((prev) => ({
        ...prev,
        error: "User data or balance is still loading",
      }));
      return;
    }

    if (liveBalance < amount * 100) {
      setState((prev) => ({
        ...prev,
        error: `Insufficient balance. Available: €${(
          liveBalance / 100
        ).toFixed(2)}`,
      }));
      return;
    }

    setState((prev) => ({ ...prev, step: "confirm", error: "" }));
  };

  const handleConfirm = async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, step: "processing" }));

    const transferData: TransferData = {
      senderUserId: user.$id,
      receiverUserId: state.selectedUserId,
      amount: Math.round(parseFloat(state.amount) * 100),
      description: state.description || "Money Transfer",
    };

    const result = await TransferService.executeTransfer(transferData);

    if (result.success) {
      setState((prev) => ({
        ...prev,
        step: "success",
        transferId: result.transferId || "",
      }));
      await refreshUser(true); // Update context (optional if used)
      onTransferComplete?.(); // 🔁 triggers useBalance() in parent
    } else {
      setState((prev) => ({
        ...prev,
        step: "error",
        error: result.error || "Transfer failed",
      }));
    }
  };

  const selectedUser = availableUsers.find(
    (u) => u.$id === state.selectedUserId
  );

  if (usersLoading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Send className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-black">Send Money</h2>
      </div>

      {state.error && state.step === "input" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700 text-sm">{state.error}</span>
        </div>
      )}

      {/* INPUT STEP */}
      {state.step === "input" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount (€)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={state.amount}
              onChange={(e) =>
                setState((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="Enter amount"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">
              Send to
            </Label>
            <Select
              value={state.selectedUserId}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, selectedUserId: value }))
              }
            >
              <SelectTrigger className="mt-1 bg-white border border-gray-300 rounded-lg">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <SelectItem
                    key={user.$id}
                    value={user.$id}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-gray-900">
                        {user.userId}
                      </span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (optional)
            </Label>
            <Input
              id="description"
              value={state.description}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What's this for?"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!state.amount || !state.selectedUserId || balLoading}
          >
            Continue
          </Button>
        </div>
      )}

      {/* CONFIRM STEP */}
      {state.step === "confirm" && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">You're about to send:</p>
            <p className="text-2xl font-bold text-green-600">€{state.amount}</p>
            <p className="text-sm text-gray-600">
              To: <span className="font-medium">{selectedUser?.userId}</span>
            </p>
            {state.description && (
              <p className="text-sm text-gray-500 mt-2">"{state.description}"</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setState((prev) => ({ ...prev, step: "input" }))}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirm & Send
            </Button>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {state.step === "processing" && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Processing your transfer...</p>
        </div>
      )}

      {/* SUCCESS */}
      {state.step === "success" && (
        <div className="text-center py-6">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700">
            Transfer Successful!
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            €{state.amount} sent to {selectedUser?.userId}
          </p>
          <Button
            onClick={resetForm}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Send Another Transfer
          </Button>
        </div>
      )}

      {/* ERROR */}
      {state.step === "error" && (
        <div className="text-center py-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700">Transfer Failed</h3>
          <p className="text-sm text-gray-600 mt-2">{state.error}</p>
          <Button
            onClick={() =>
              setState((prev) => ({ ...prev, step: "input", error: "" }))
            }
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default SimpleMoneyTransfer;
