import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProgress } from "@/context/ProgressContext";
import CodeViewer from "@/components/CodeViewer";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { terraformCode, cloudConnected, resourceCreated, setTerraformCode, setCloudConnected, setResourceCreated } = useProgress();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(terraformCode);
      toast({
        title: "Code Copied",
        description: "Terraform code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleResetProgress = () => {
    setTerraformCode("");
    setCloudConnected(false);
    setResourceCreated(false);
    setDialogOpen(false);
    toast({
      title: "Progress Reset",
      description: "Your progress has been reset successfully.",
    });
  };

  return (
    <Layout promptHistory={[]}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Welcome to Cloud Compliance AI
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Manage your cloud resources and ensure compliance with ease.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Start by connecting to your cloud provider, creating resources, or checking compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/cloud-connection")}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                Cloud Connection
              </Button>
              <Button
                onClick={() => navigate("/resource-creation")}
                disabled={!cloudConnected}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
              >
                Resource Creation
              </Button>
              <Button
                onClick={() => navigate("/compliance")}
                disabled={!resourceCreated}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:scale-100"
              >
                Compliance Check
              </Button>
            </div>
            {terraformCode && (
              <CodeViewer
                code={terraformCode}
                onCopy={handleCopyCode}
                onDownload={() => {
                  const blob = new Blob([terraformCode], { type: "text/plain" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "main.tf";
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}
              />
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Reset Progress
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-800 dark:text-white">
                    Reset Progress
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to reset your progress? This will clear all generated Terraform code and cloud connection status.
                  </DialogDescription>
                </DialogHeader>
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
                    onClick={handleResetProgress}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Reset
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