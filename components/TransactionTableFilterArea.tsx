"use client";

import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterAreaProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    dateFilter: { from: Date | undefined; to: Date | undefined };
    setDateFilter: (filter: { from: Date | undefined; to: Date | undefined }) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    availableStatuses: string[];
    transactionType: string;
    setTransactionType: (value: string) => void;
    availableTransactionTypes: string[];
}

const TransactionTableFilterArea: React.FC<FilterAreaProps> = ({
                                                                   searchQuery,
                                                                   setSearchQuery,
                                                                   selectedCategory,
                                                                   setSelectedCategory,
                                                                   dateFilter,
                                                                   setDateFilter,
                                                                   selectedStatus,
                                                                   setSelectedStatus,
                                                                   availableStatuses,
                                                                   transactionType,
                                                                   setTransactionType,
                                                                   availableTransactionTypes,
                                                               }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const formatDate = (date: Date | undefined) =>
        date ? format(date, "MMM dd, yyyy") : "";

    // Helper function to update query params and reset page.
    const updateQueryParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set(key, value);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    // Copilot readable filters
    useCopilotReadable({
        description: "All active filters for the transaction table.",
        value: { searchQuery, selectedCategory, dateFilter, selectedStatus, transactionType },
    });

    // Copilot action to update filters
    useCopilotAction({
        name: "updateFilters",
        description: "Update filters for the transaction table.",
        parameters: [
            {
                name: "filterType",
                type: "string",
                description:
                    "Type of filter to update (e.g., searchQuery, category, date, status, transactionType).",
                required: true,
            },
            {
                name: "value",
                type: "string",
                description: "New value for the specified filter.",
                required: true,
            },
        ],
        handler: async ({
                            filterType,
                            value,
                        }: {
            filterType: string;
            value: string;
        }) => {
            try {
                if (filterType === "searchQuery") {
                    setSearchQuery(value);
                    updateQueryParams("searchQuery", value);
                } else if (filterType === "category") {
                    setSelectedCategory(value);
                    updateQueryParams("category", value);
                } else if (filterType === "date") {
                    // Parse possible date range or single date
                    let from: Date | null = null;
                    let to: Date | null = null;
                    let separator: string | null = null;

                    if (value.includes(" to ")) {
                        separator = " to ";
                    } else if (value.includes("_")) {
                        separator = "_";
                    }

                    if (separator) {
                        const [fromRaw, toRaw] = value.split(separator);
                        from = parseISO(fromRaw.trim());
                        to = parseISO(toRaw.trim());
                        if (!isValid(from) || !isValid(to)) {
                            throw new Error("Invalid date range provided.");
                        }
                        updateQueryParams(
                            "date",
                            `${from.toISOString()}_${to.toISOString()}`
                        );
                        setDateFilter({ from, to });
                    } else {
                        // Single date input
                        from = parseISO(value.trim());
                        if (!isValid(from)) {
                            throw new Error("Invalid single date provided.");
                        }
                        updateQueryParams("date", from.toISOString());
                        setDateFilter({ from, to: undefined });
                    }
                } else if (filterType === "status") {
                    setSelectedStatus(value);
                    updateQueryParams("status", value);
                } else if (filterType === "transactionType") {
                    setTransactionType(value);
                    updateQueryParams("transactionType", value);
                } else {
                    console.error("Invalid filterType provided");
                }
            } catch (error: any) {
                console.error("Error updating filters:", error.message);
            }
        },
    });

    return (
        <div className="filters mb-4 flex flex-wrap gap-4">
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateQueryParams("searchQuery", e.target.value);
                }}
                className="px-4 py-2 bg-white text-black border border-gray-300 rounded-lg"
            />

            {/* Category Dropdown */}
            <Select
                onValueChange={(value) => {
                    setSelectedCategory(value);
                    updateQueryParams("category", value);
                }}
            >
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue
                        placeholder={selectedCategory || "Select Category"}
                    />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {[
                        "All Categories",
                        "Food & Beverages",
                        "Shopping",
                        "Travel",
                        "Entertainment",
                        "Housing",
                        "Friends & Family",
                        "Health & Fitness",
                        "Transportation",
                        "Utilities",
                        "Education",
                        "Personal Care",
                        "Insurance",
                        "Savings",
                        "Gifts",
                        "Others",
                    ].map((category) => (
                        <SelectItem key={category} value={category}>
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Transaction Type Dropdown */}
            <Select
                onValueChange={(value) => {
                    setTransactionType(value);
                    updateQueryParams("transactionType", value);
                }}
            >
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue
                        placeholder={transactionType || "Select Transaction Type"}
                    />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    <SelectItem value="Incoming & Outgoing">
                        Incoming &amp; Outgoing
                    </SelectItem>
                    <SelectItem value="incoming">Incoming payments only</SelectItem>
                    <SelectItem value="outgoing">Outgoing payments only</SelectItem>
                </SelectContent>
            </Select>

            {/* Status Dropdown */}
            <Select
                onValueChange={(value) => {
                    setSelectedStatus(value);
                    updateQueryParams("status", value);
                }}
            >
                <SelectTrigger className="w-[250px] bg-white text-black border border-gray-300 rounded-lg">
                    <SelectValue placeholder={selectedStatus || "Select Status"} />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[250px] justify-start bg-white text-black border border-gray-300 rounded-lg"
                        )}
                    >
                        {dateFilter?.from && dateFilter?.to
                            ? `${formatDate(dateFilter.from)} - ${formatDate(dateFilter.to)}`
                            : dateFilter?.from
                                ? formatDate(dateFilter.from)
                                : "Select Date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn("w-auto p-0 bg-white border border-gray-300 rounded-lg")}
                    align="start"
                >
                    <Calendar
                        mode="range"
                        selected={{
                            from: dateFilter.from,
                            to: dateFilter.to,
                        }}
                        onSelect={(range) => {
                            const from = range?.from ? range.from.toISOString() : "";
                            const to = range?.to ? new Date(range.to).toISOString() : "";
                            setDateFilter({
                                from: range?.from ?? undefined,
                                to: range?.to ?? undefined,
                            });
                            updateQueryParams("date", `${from}_${to}`);
                        }}
                        numberOfMonths={1}
                        initialFocus
                        defaultMonth={dateFilter?.from}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TransactionTableFilterArea;
