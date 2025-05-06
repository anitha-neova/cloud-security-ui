import { useState } from "react";
import Header from "@/components/Header";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 container mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-bold">Compliance Check</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What would you like to check for compliance?</CardTitle>
              <CardDescription>
                Describe the specific compliance requirements or regulations you want to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Check S3 buckets for CIS compliance..."
                className="min-h-[100px]"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isProcessing}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleGenerateReport} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Generate Compliance Report"}
              </Button>
            </CardFooter>
          </Card>

          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle>Processing</CardTitle>
                <CardDescription>{currentStep}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-2" />
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
        </div>
      </main>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Compliance Report</DialogTitle>
            <DialogDescription>
              Enter the email addresses (comma-separated) where the report should be sent.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder="example@domain.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEmailSend}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompliancePage;
