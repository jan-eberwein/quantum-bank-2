"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDateTime, removeSpecialCharacters } from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";
import { Transaction, TransactionCategory, TransactionStatus } from "@/types/Transaction";

interface CategoryBadgeProps {
    categoryName: string;
}

const CategoryBadge = ({ categoryName }: CategoryBadgeProps) => {
    const {
        borderColor,
        backgroundColor,
        textColor,
        chipBackgroundColor,
    } = transactionCategoryStyles[categoryName as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;

    return (
        <div className={`category-badge ${borderColor} ${chipBackgroundColor}`}>
            <div className={`size-2 rounded-full ${backgroundColor}`} />
            <p className={`text-[12px] font-medium ${textColor}`}>{categoryName}</p>
        </div>
    );
};

interface TransactionTableProps {
    transactions: Transaction[];
    categories: TransactionCategory[];
    statuses: TransactionStatus[];  // Now using unified TransactionStatus
    dateFormat?: "short" | "long";
    showStatus?: boolean;
}

const TransactionTable = ({
                              transactions,
                              categories,
                              statuses,
                              dateFormat = "short",
                              showStatus = true,
                          }: TransactionTableProps) => {
    // Defensive check
    if (!Array.isArray(categories) || !Array.isArray(statuses)) {
        return (
            <div className="p-4 text-center text-sm text-gray-500">
                Transaction data is not available.
            </div>
        );
    }

    const categoryMap = new Map(categories.map(cat => [cat.$id, cat.name]));
    const statusMap = new Map(statuses.map(status => [status.$id, status.name]));

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    {showStatus && <TableHead>Status</TableHead>}
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => {
                    const categoryName = categoryMap.get(transaction.transactionCategoryId) || "Unknown";
                    const statusName = statusMap.get(transaction.transactionStatusId) || "Unknown";
                    const transactionDate = new Date(transaction.createdAt);

                    return (
                        <TableRow key={transaction.$id}>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold">
                                        {removeSpecialCharacters(transaction.merchant)}
                                    </span>
                                    {transaction.description && (
                                        <span className="text-sm text-gray-600">
                                            {transaction.description}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell
                                className={`font-semibold ${
                                    transaction.amount < 0 ? "text-red-600" : "text-green-600"
                                }`}
                            >
                                {formatAmount(transaction.amount)}
                            </TableCell>
                            {showStatus && (
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            statusName === "Completed"
                                                ? "bg-green-100 text-green-800"
                                                : statusName === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : statusName === "Rejected"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {statusName}
                                    </span>
                                </TableCell>
                            )}
                            <TableCell>
                                {dateFormat === "short"
                                    ? formatDateTime(transactionDate).dayMonth
                                    : formatDateTime(transactionDate).dateTime}
                            </TableCell>
                            <TableCell>
                                <CategoryBadge categoryName={categoryName} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default TransactionTable;