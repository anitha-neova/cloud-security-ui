import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose // Import DialogClose
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Info, Cloud, FileCode, ClipboardCopy } from "lucide-react";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const {
    cloudConnected,
    resourceCreated,
    complianceChecked,
    setStep,
    terraformCode,
    setCloudConnected,
    setResourceCreated,
    setComplianceChecked,
  } = useProgress();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // Add state to control the dialog's open/close

  const handleNavigateToCloudConnect = () => {
    setStep(1);
    navigate("/cloud-connect");
  };

  const handleNavigateToResourceCreation = () => {
    setStep(2);
    navigate("/resource-creation");
  };

  const handleNavigateToCompliance = () => {
    setStep(3);
    navigate("/compliance");
  };

  const handleCopyCode = async () => {
    if (terraformCode) {
      await navigator.clipboard.writeText(terraformCode);
      toast({
        title: "Copied!",
        description: "Terraform code copied to clipboard."
      });
    }
  };

  const handleResetProgress = () => {
    // Reset all progress states
    setCloudConnected(false);
    setResourceCreated(false);
    setComplianceChecked(false);
    setStep(0);
    toast({
      title: "Progress reset",
      description: "All progress has been cleared in the UI."
    });

    // Close the dialog after resetting progress
    setIsDialogOpen(false); // This will close the dialog
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar promptHistory={[]} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6 container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold">AI-Powered Cloud Compliance Automation</h1>
            <div className="flex flex-col gap-6">
              {/* Cloud Connect Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Connect to Cloud</CardTitle>
                  <CardDescription>
                    Connect to your cloud provider to begin analyzing resources and checking compliance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Cloud className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      Connect your AWS, Azure, GCP, or IBM Cloud account to start analyzing your infrastructure.
                    </p>
                  </div>
                  <Button onClick={handleNavigateToCloudConnect} disabled={cloudConnected}>
                    Connect Cloud Provider
                  </Button>
                </CardContent>
              </Card>

              {/* Resource Creation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Creation</CardTitle>
                  <CardDescription>
                    Create cloud resources using AI-generated Terraform code based on your description.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-blue-100">
                      <FileCode className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Describe the resources you want and let AI generate the Terraform code.
                    </p>
                  </div>
                  <Button
                    onClick={handleNavigateToResourceCreation}
                    disabled={!cloudConnected || resourceCreated}
                  >
                    Create Resources
                  </Button>
                </CardContent>
              </Card>

              {/* Terraform Code Display */}
              {terraformCode && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Terraform Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <pre className="bg-muted p-4 rounded overflow-auto text-sm whitespace-pre-wrap">
                        {terraformCode.slice(0, 300)}
                        {terraformCode.length > 300 ? "..." : ""}
                      </pre>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">View Full Code</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Terraform Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={handleCopyCode}
                              className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded hover:bg-primary/80"
                              title="Copy to Clipboard"
                            >
                              <ClipboardCopy className="w-4 h-4" />
                              Copy Code
                            </button>
                          </div>
                          <div className="bg-muted p-4 rounded overflow-auto max-h-[500px] text-sm whitespace-pre-wrap w-full">
                            {terraformCode}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Check Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Check</CardTitle>
                  <CardDescription>
                    Generate compliance reports and analyze your cloud infrastructure against best practices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-green-100">
                      <Info className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Run compliance checks and get detailed reports with security recommendations.
                    </p>
                  </div>
                  <Button
                    onClick={handleNavigateToCompliance}
                    disabled={!resourceCreated || complianceChecked}
                  >
                    Compliance Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Reset Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Reset Progress</CardTitle>
                  <CardDescription>
                    This will clear your current session's progress (cloud connection, resources, and compliance results) in the UI. No changes will be made to your cloud infrastructure or stored data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Reset Progress</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        This will clear all progress and cannot be undone.
                      </p>
                      <DialogFooter className="mt-4">
                        <Button variant="secondary">
                          <DialogClose>Cancel</DialogClose>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleResetProgress}
                        >
                          Yes, Reset
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
