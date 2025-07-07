"use client";

import React from "react";
import { format, parseISO, isValid, startOfDay, endOfDay } from "date-fns";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";

interface Props {
    searchQuery: string;
    setSearchQuery: (v: string) => void;

    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    availableCategories: string[];

    dateFilter: { from?: Date; to?: Date };
    setDateFilter: (v: DateRange) => void;

    selectedStatus: string;
    setSelectedStatus: (v: string) => void;
    availableStatuses: string[];

    transactionType: string;
    setTransactionType: (v: string) => void;
    availableTransactionTypes: string[];
}

const TransactionTableFilterArea: React.FC<Props> = (props) => {
    const {
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory, availableCategories,
        dateFilter, setDateFilter,
        selectedStatus, setSelectedStatus, availableStatuses,
        transactionType, setTransactionType, availableTransactionTypes
    } = props;

    /* ── Copilot Actions ────────────────────────────────────────── */
    useCopilotReadable({
        description: "Current transaction table filters",
        value: {searchQuery, selectedCategory, selectedStatus, dateFilter, transactionType},
    });

    useCopilotAction({
        name: "updateFilters",
        description: "Update a transaction filter (searchQuery, category, status, or transactionType). For dates, use the setDateFilterRange action instead.",
        parameters: [
            {
                name: "filterType",
                type: "string",
                description: "The type of filter to update. MUST be one of the following exact values: 'searchQuery', 'category', 'status', 'transactionType'.",
                required: true,
            },
            {
                name: "value",
                type: "string",
                description: "The new value for the selected filter.",
                required: true,
            },
        ],
        handler: async ({filterType, value}) => {
            try {
                if (typeof value !== 'string') {
                    console.error("Filter update error: received non-string value for filter", { filterType, value });
                    return `❌ Failed to update filter. The provided value was not in the correct text format.`;
                }

                switch (filterType) {
                    case "searchQuery":
                        setSearchQuery(value);
                        break;
                    case "category":
                        setSelectedCategory(value);
                        break;
                    case "status":
                        setSelectedStatus(value);
                        break;
                    case "transactionType":
                    {
                        const lowerValue = value.toLowerCase();
                        if (lowerValue === 'incoming' || lowerValue === 'outgoing') {
                            setTransactionType(lowerValue);
                        } else {
                            setTransactionType('Incoming & Outgoing');
                        }
                    }
                        break;
                    default:
                        throw new Error("Unknown filterType");
                }
                return `✅ Filter ${filterType} updated successfully`;
            } catch (err) {
                console.error("Filter update error:", err);
                return `❌ Failed to update ${filterType} filter: ${err instanceof Error ? err.message : 'Unknown error'}`;
            }
        },
    });

    useCopilotAction({
        name: "setDateFilterRange",
        description: "Set a date range filter for transactions. Use this for requests like 'show transactions from last month' or 'show transactions in May 2025'.",
        parameters: [
            {
                name: "fromDate",
                type: "string",
                description: "The start date of the range in yyyy-MM-dd format.",
                required: true,
            },
            {
                name: "toDate",
                type: "string",
                description: "The end date of the range in yyyy-MM-dd format.",
                required: true,
            },
        ],
        handler: async ({ fromDate, toDate }) => {
            try {
                const from = startOfDay(parseISO(fromDate));
                const to = endOfDay(parseISO(toDate));

                if (!isValid(from) || !isValid(to)) {
                    throw new Error("Invalid date format provided. Please use yyyy-MM-dd.");
                }

                if (from > to) {
                    throw new Error("The start date cannot be after the end date.");
                }

                setDateFilter({ from, to });
                return "✅ Date filter set successfully.";
            } catch (err) {
                console.error("Set date filter error:", err);
                return `❌ Failed to set date filter: ${err instanceof Error ? err.message : 'Unknown error'}`;
            }
        },
    });


    /* Clear all filters action */
    useCopilotAction({
        name: "clearAllFilters",
        description: "Clear all filters to show all transactions",
        parameters: [],
        handler: async () => {
            try {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedStatus("All Statuses");
                setTransactionType("Incoming & Outgoing");
                setDateFilter({ from: undefined, to: undefined });
                return "✅ All filters have been cleared.";
            } catch (err) {
                console.error("Clear all filters error:", err);
                return "❌ Failed to clear all filters";
            }
        },
    });

    /* ── UI ───────────────────────────────────────────── */
    return (
        <div className="flex flex-wrap gap-4">
            {/* Search */}
            <input
                type="text"
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px] rounded-lg border border-gray-300 px-3 py-2"
            />

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder="All Categories"/>
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Transaction type */}
            <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder="Incoming & Outgoing"/>
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableTransactionTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder="All Statuses"/>
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableStatuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date range */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline"
                            className="w-[250px] justify-start bg-white text-black border border-gray-300 rounded-lg">
                        {dateFilter.from
                            ? dateFilter.to
                                // --- FIX: Corrected date format from "évidence" to "yyyy" ---
                                ? `${format(dateFilter.from, "MMM dd, yyyy")} - ${format(dateFilter.to, "MMM dd, yyyy")}`
                                : format(dateFilter.from, "MMM dd, yyyy")
                            : "Select Date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto p-0 bg-white border border-gray-300 rounded-lg")} align="start">
                    <Calendar
                        mode="range"
                        selected={dateFilter as DateRange}
                        onSelect={(range) => setDateFilter(range || { from: undefined, to: undefined })}
                        numberOfMonths={1}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TransactionTableFilterArea;