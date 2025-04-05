import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {TestShadcnChart} from "@/components/TestShadcnChart";
import {Check} from "lucide-react";

export function TestShadcnChartCard() {
    return (
        <Card className="">
            <CardHeader>
                <CardTitle>TestShadcnChart</CardTitle>
                <CardDescription>This is a static test chart.</CardDescription>
            </CardHeader>
            <CardContent>
                <TestShadcnChart></TestShadcnChart>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button className="w-full">
                    <Check /> Add to Dashboard
                </Button>
            </CardFooter>
        </Card>
    )
}
