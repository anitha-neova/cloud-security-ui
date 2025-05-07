import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail } from "lucide-react";

interface ComplianceReportProps {
    reportId: string;
    onDownloadPDF: () => void;
    onEmailReport: () => void;
    data?: any;
    isDownloading?: boolean;
}

const ComplianceReport = ({ reportId, onDownloadPDF, onEmailReport, data, isDownloading }: ComplianceReportProps) => {
    const handleDownloadPDF = () => {
        onDownloadPDF();
    };

    const handleEmailReport = () => {
        console.log("Email Report clicked"); // Debug logging
        onEmailReport();
    };

    return (
        <Card
            className="w-full max-w-3xl mx-auto bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700"
        >
            <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Compliance Report
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                    Download or email your compliance report for {reportId}.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={handleEmailReport}
                    >
                        <Mail className="h-5 w-5 mr-2" />
                        Email Report
                    </Button>
                    <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        <Download className="h-5 w-5 mr-2" />
                        {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComplianceReport;