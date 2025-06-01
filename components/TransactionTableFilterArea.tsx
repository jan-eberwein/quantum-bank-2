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
        params.set(key, value);
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
                        /** accept either `YYYY-MM-DD to YYYY-MM-DD` or `fromISO_toISO` */
                        const sep = value.includes(" to ") ? " to " : "_";
                        const [rawFrom, rawTo] = value.split(sep);
                        const from = parseISO(rawFrom.trim());
                        const to = rawTo ? parseISO(rawTo.trim()) : undefined;
                        if (!isValid(from) || (rawTo && !isValid(to!))) throw new Error("Invalid date(s)");
                        setDateFilter({from, to});
                        updateQueryParams("date", `${from.toISOString()}_${to?.toISOString() ?? ""}`);
                        break;
                    }
                    default:
                        throw new Error("Unknown filterType");
                }
            } catch (err) {
                console.error(err);
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
                            // 1) handle “clear” (range === undefined)
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
