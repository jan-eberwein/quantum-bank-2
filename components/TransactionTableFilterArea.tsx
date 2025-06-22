"use client";

import React from "react";
import {format, parseISO, isValid} from "date-fns";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {Button} from "@/components/ui/button";
import {CalendarIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {useCopilotAction, useCopilotReadable} from "@copilotkit/react-core";
import {useRouter, useSearchParams} from "next/navigation";
import {DateRange} from "react-day-picker";

interface Props {
    searchQuery: string;
    setSearchQuery: (v: string) => void;

    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    availableCategories: string[];

    dateFilter: { from?: Date; to?: Date };
    setDateFilter: (v: { from?: Date; to?: Date }) => void;

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

    const router = useRouter();
    const searchParams = useSearchParams();

    const updateQueryParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    /* ── Copilot exposure ─────────────────────────────── */
    useCopilotReadable({
        description: "Current transaction table filters",
        value: {searchQuery, selectedCategory, selectedStatus, dateFilter, transactionType},
    });

    /* Allow Copilot to change filters programmatically */
    useCopilotAction({
        name: "updateFilters",
        description: "Update one of the transaction filters",
        parameters: [
            {name: "filterType", type: "string", required: true},
            {name: "value", type: "string", required: true},
        ],
        handler: async ({filterType, value}) => {
            try {
                switch (filterType) {
                    case "searchQuery":
                        setSearchQuery(value);
                        updateQueryParams("searchQuery", value);
                        break;
                    case "category":
                        setSelectedCategory(value);
                        updateQueryParams("category", value);
                        break;
                    case "status":
                        setSelectedStatus(value);
                        updateQueryParams("status", value);
                        break;
                    case "transactionType":
                        setTransactionType(value);
                        updateQueryParams("transactionType", value);
                        break;
                    case "date": {
                        // Handle date filter clearing and setting
                        if (!value || value === "" || value.toLowerCase() === "clear" || value.toLowerCase() === "remove") {
                            // Clear the date filter
                            setDateFilter({ from: undefined, to: undefined });
                            updateQueryParams("date", "");
                            console.log("✅ Date filter cleared");
                            break;
                        }

                        /** accept either `YYYY-MM-DD to YYYY-MM-DD` or `fromISO_toISO` */
                        const sep = value.includes(" to ") ? " to " : "_";
                        const [rawFrom, rawTo] = value.split(sep);

                        if (!rawFrom || rawFrom.trim() === "") {
                            // If no valid from date, clear the filter
                            setDateFilter({ from: undefined, to: undefined });
                            updateQueryParams("date", "");
                            break;
                        }

                        const from = parseISO(rawFrom.trim());
                        const to = rawTo && rawTo.trim() ? parseISO(rawTo.trim()) : undefined;

                        if (!isValid(from)) {
                            console.error("Invalid from date:", rawFrom);
                            throw new Error(`Invalid from date: ${rawFrom}`);
                        }

                        if (rawTo && rawTo.trim() && !isValid(to!)) {
                            console.error("Invalid to date:", rawTo);
                            throw new Error(`Invalid to date: ${rawTo}`);
                        }

                        setDateFilter({from, to});
                        updateQueryParams("date", `${from.toISOString()}_${to?.toISOString() ?? ""}`);
                        console.log("✅ Date filter set:", {from, to});
                        break;
                    }
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

    /* Clear date filter action */
    useCopilotAction({
        name: "clearDateFilter",
        description: "Clear/remove the date filter to show all transactions",
        parameters: [],
        handler: async () => {
            try {
                setDateFilter({ from: undefined, to: undefined });
                updateQueryParams("date", "");
                console.log("✅ Date filter cleared via clearDateFilter action");
                return "✅ Date filter has been successfully removed. All transactions are now visible.";
            } catch (err) {
                console.error("Clear date filter error:", err);
                return "❌ Failed to clear date filter";
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

                // Clear URL params
                updateQueryParams("searchQuery", "");
                updateQueryParams("category", "");
                updateQueryParams("status", "");
                updateQueryParams("transactionType", "");
                updateQueryParams("date", "");

                console.log("✅ All filters cleared");
                return "✅ All filters have been cleared. Showing all transactions.";
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
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateQueryParams("searchQuery", e.target.value);
                }}
                className="w-[250px] rounded-lg border border-gray-300 px-3 py-2"
            />

            {/* Category */}
            <Select onValueChange={(v) => {
                setSelectedCategory(v);
                updateQueryParams("category", v);
            }}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder={selectedCategory || "All Categories"}/>
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Transaction type */}
            <Select onValueChange={(v) => {
                setTransactionType(v);
                updateQueryParams("transactionType", v);
            }}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder={transactionType}/>
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableTransactionTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status */}
            <Select onValueChange={(v) => {
                setSelectedStatus(v);
                updateQueryParams("status", v);
            }}>
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder={selectedStatus}/>
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
                                ? `${format(dateFilter.from, "MMM dd, yyyy")} - ${format(dateFilter.to, "MMM dd, yyyy")}`
                                : format(dateFilter.from, "MMM dd, yyyy")
                            : "Select Date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto p-0 bg-white border border-gray-300 rounded-lg")} align="start">
                    <Calendar
                        mode="range"
                        selected={{ from: dateFilter.from, to: dateFilter.to }}
                        onSelect={(range: DateRange | undefined) => {
                            // 1) handle "clear" (range === undefined)
                            if (!range) {
                                setDateFilter({ from: undefined, to: undefined });
                                updateQueryParams("date", "");
                                return;
                            }

                            // 2) proper non-undefined range
                            setDateFilter({ from: range.from, to: range.to });

                            // 3) update the URL
                            updateQueryParams(
                                "date",
                                `${range.from?.toISOString() ?? ""}_${range.to?.toISOString() ?? ""}`
                            );
                        }}
                        numberOfMonths={1}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TransactionTableFilterArea;