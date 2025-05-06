import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download } from "lucide-react";
import ComplianceReport from "@/components/ComplianceReport";
import {
  runComplianceScan,
  downloadComplianceReport,
  emailComplianceReport,
} from "@/services/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";

const CompliancePage = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const { toast } = useToast();

  const simulateProgress = (targetProgress: number) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= targetProgress) {
            clearInterval(interval);
            resolve();
            return targetProgress;
          }
          return prev + 2;
        });
      }, 100);
    });
  };

  const handleGenerateReport = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt describing what compliance to check for.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep("Analyzing cloud resources");

      await simulateProgress(30);

      setCurrentStep("Running compliance scan");
      const response = await runComplianceScan({ prompt: userPrompt });

      await simulateProgress(75);

      setCurrentStep("Analyzing CIS compliance");
      await simulateProgress(95);

      setCurrentStep("Complete");
      setProgress(100);

      setComplianceData(response.compliance_data || {});

      toast({
        title: "Report Generated",
        description: "Compliance report has been successfully generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await downloadComplianceReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cis_compliance_report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "The compliance report is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleEmailSend = async () => {
    if (!recipientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await emailComplianceReport({ recipient_email: recipientEmail });
      toast({
        title: "Email Sent",
        description: response.message || "The compliance report has been emailed successfully.",
      });
      setEmailDialogOpen(false);
      setRecipientEmail("");
    } catch (error) {
      toast({
        title: "Email Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout promptHistory={[]}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Compliance Check
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Describe the specific compliance requirements or regulations you want to analyze.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="e.g., Check S3 buckets for CIS compliance..."
              className="min-h-[100px] border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={isProcessing}
            />
          </CardContent>
          <CardFooter className="p-6 flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              {isProcessing ? "Processing..." : "Generate Compliance Report"}
            </Button>
          </CardFooter>
        </Card>

        {isProcessing && (
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                Processing
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {currentStep}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Progress
                value={progress}
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                indicatorClassName="bg-blue-500"
              />
            </CardContent>
          </Card>
        )}

        {complianceData && (
          <ComplianceReport
            data={complianceData}
            onDownload={handleDownloadReport}
            onEmail={() => setEmailDialogOpen(true)}
          />
        )}

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-white">
                Send Compliance Report
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Enter the email addresses (comma-separated) where the report should be sent.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder="example@domain.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
            />
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleEmailSend}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CompliancePage;