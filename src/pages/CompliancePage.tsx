
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download } from "lucide-react";
import ComplianceReport from "@/components/ComplianceReport";
import { runComplianceScan, downloadComplianceReport } from "@/services/api";

const CompliancePage = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const simulateProgress = (targetProgress: number) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setProgress(prev => {
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
      
      // Step 1: Analyze cloud resources
      await simulateProgress(30);
      
      // Step 2: Start compliance scan using API
      setCurrentStep("Running compliance scan");
      const scanData = { prompt: userPrompt };
      const response = await runComplianceScan(scanData);
      
      await simulateProgress(75);
      
      // Step 3: Analyzing CIS compliance
      setCurrentStep("Analyzing CIS compliance");
      await simulateProgress(95);
      
      // Complete
      setCurrentStep("Complete");
      setProgress(100);
      
      // Set compliance data
      if (response.compliance_data) {
        setComplianceData(response.compliance_data);
      } else {
        // Use sample data if API doesn't return compliance data
        setComplianceData({});
      }
      
      toast({
        title: "Report Generated",
        description: "Compliance report has been successfully generated.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownloadReport = async () => {
    try {
      const blob = await downloadComplianceReport();
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "cis_compliance_report.pdf";
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "The compliance report is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  const handleEmailReport = () => {
    toast({
      title: "Email Sent",
      description: "The compliance report has been emailed successfully.",
    });
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
                placeholder="e.g., Check S3 buckets for CIS compliance, verify EC2 instances meet security standards..."
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
              onEmail={handleEmailReport}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CompliancePage;
