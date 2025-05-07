import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { useProgress } from "@/context/ProgressContext";

const ReportsPage = () => {
    const { reports } = useProgress();
    const [selectedReport, setSelectedReport] = useState<{
        id: string;
        title: string;
        content: string;
        date: string;
    } | null>(null);

    const handleViewReport = (report: {
        id: string;
        title: string;
        content: string;
        date: string;
    }) => {
        console.log("Selected report:", report); // Debug logging
        setSelectedReport(report);
    };

    return (
        <Layout promptHistory={[]}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
                {reports.length === 0 ? (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        No reports available. Generate a compliance report to see it here.
                    </div>
                ) : (
                    reports.map((report) => (
                        <Card
                            key={report.id}
                            className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
                                    {report.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(report.date).toLocaleDateString()}
                                </p>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Button
                                    onClick={() => handleViewReport(report)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 w-full transition-all duration-200 hover:scale-105"
                                >
                                    View Report
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog
                open={selectedReport !== null}
                onOpenChange={() => setSelectedReport(null)}
            >
                <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-gray-800 dark:text-white">
                            {selectedReport?.title || "Report"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedReport
                                ? `Generated on ${new Date(selectedReport.date).toLocaleDateString()}`
                                : "No report selected"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-3 overflow-auto max-h-[600px] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedReport && selectedReport.content ? (
                            <pre>{selectedReport.content}</pre>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">
                                No report data available. The compliance scan may have returned no results.
                            </p>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                            >
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default ReportsPage;