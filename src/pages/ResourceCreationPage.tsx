import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { createCloudResource } from "@/services/api";
import { useProgress } from "@/context/ProgressContext"; // 👈 NEW

const ResourceCreationPage = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terraformCode, setTerraformCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { setResourceCreated, setTerraformCode: setContextTerraformCode } = useProgress(); // 👈 use context

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

  const handleCreateResource = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt describing the resource you want to create.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setTerraformCode("");
      setProgress(0);
      setCurrentStep("Analyzing resource requirements");
      await simulateProgress(30);

      setCurrentStep("Creating cloud resource");
      const result = await createCloudResource({ prompt: userPrompt });
      await simulateProgress(100);

      setCurrentStep("Complete");

      if (result?.terraform_code) {
        setTerraformCode(result.terraform_code);
        setContextTerraformCode(result.terraform_code); // Store code in context
        setResourceCreated(true); // 👈 Update context after success
      }

      toast({
        title: "Resource Created",
        description: "The cloud resource has been successfully created.",
      });

      // Redirect to home page after success
      navigate("/");

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 container mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-bold">Resource Creation</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What resources would you like to create?</CardTitle>
              <CardDescription>
                Describe the cloud resources you want to create with specific parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Create AWS S3 bucket with versioning and encryption"
                className="min-h-[100px]"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isProcessing}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleCreateResource} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Create Resource"}
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
        </div>
      </main>
    </div>
  );
};

export default ResourceCreationPage;
