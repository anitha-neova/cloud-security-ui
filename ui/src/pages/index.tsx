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
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Cloud, FileCode, ClipboardCopy, Info } from "lucide-react";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";

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
    setTerraformCode,
    setComplianceChecked,
    reports,
    setReports
  } = useProgress();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
    setCloudConnected(false);
    setResourceCreated(false);
    setComplianceChecked(false);
    setTerraformCode("");
    setStep(0);
    setReports([]);
    toast({
      title: "Progress reset",
      description: "All progress has been cleared in the UI."
    });
    setIsDialogOpen(false);
  };

  return (
      <Layout promptHistory={[]}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
          {/* Cloud Connect Card */}
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 min-h-[200px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Connect to Cloud
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Connect to your cloud provider to begin analyzing resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-gray-700">
                  <Cloud className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  Connect your AWS, Azure, GCP, or IBM Cloud account.
                </p>
              </div>
              <Button
                  onClick={handleNavigateToCloudConnect}
                  disabled={cloudConnected}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
              >
                Connect Cloud
              </Button>
            </CardContent>
          </Card>

          {/* Resource Creation Card */}
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 min-h-[200px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Resource Creation
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Create cloud resources with AI-generated Terraform code.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-gray-700">
                  <FileCode className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  Describe resources and generate Terraform code.
                </p>
              </div>
              <Button
                  onClick={handleNavigateToResourceCreation}
                  disabled={!cloudConnected || resourceCreated}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
              >
                Create Resources
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Check Card */}
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 min-h-[200px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Compliance Check
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Generate compliance reports and analyze your cloud infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-gray-700">
                  <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  Run compliance checks and get detailed reports.
                </p>
              </div>
              <Button
                  onClick={handleNavigateToCompliance}
                  disabled={!resourceCreated || complianceChecked}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
              >
                Compliance Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Terraform Code Display */}
          {terraformCode && (
              <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 col-span-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    Generated Terraform Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                <pre className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {terraformCode.slice(0, 300)}
                  {terraformCode.length > 300 ? "..." : ""}
                </pre>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                        >
                          View Full Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700 max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800 dark:text-white">
                            Terraform Code
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-end mb-2">
                          <Button
                              onClick={handleCopyCode}
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                              title="Copy to Clipboard"
                          >
                            <ClipboardCopy className="w-4 h-4" />
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-3 overflow-auto max-h-[500px] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap w-full">
                          {terraformCode}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Reset Progress Card */}
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 min-h-[200px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Reset Progress
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Clear your session's progress in the UI.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-gray-700">
                  <ClipboardCopy className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  Reset cloud connection, resources, and compliance.
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                  >
                    Reset Progress
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-800 dark:text-white">
                      Are you sure?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                      This will clear all progress and cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                        onClick={handleResetProgress}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                    >
                      Yes, Reset
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
};

export default Index;