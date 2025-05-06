import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { createCloudResource } from "@/services/api";
import { useProgress } from "@/context/ProgressContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Layout from "@/components/Layout";

const ResourceCreationPage = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terraformCode, setTerraformCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState<string | undefined>();

  const { setResourceCreated, setTerraformCode: setContextTerraformCode } = useProgress();

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
    if (!selectedResource) {
      toast({
        title: "Resource Type Required",
        description: "Please select a resource type before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!userPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt describing the resource you want to create.",
        variant: "destructive",
      });
      return;
    }

    const selected = selectedResource.trim().toLowerCase();
    const prompt = userPrompt.trim().toLowerCase();

    if (prompt.includes(selected)) {
      toast({
        title: "Duplicate Resource Mentioned",
        description: `Your prompt already includes "${selectedResource}". Please avoid repeating it.`,
        variant: "destructive",
      });
      return;
    }

    const knownResources = ["s3", "ec2", "iam", "vpc", "lambda"];
    const conflictingResource = knownResources.find(
      (res) => prompt.includes(res) && res !== selected
    );

    if (conflictingResource) {
      toast({
        title: "Conflicting Resource Detected",
        description: `Your prompt mentions "${conflictingResource}", which doesn't match the selected resource type "${selectedResource}".`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setTerraformCode("");
      setProgress(0);
      const updatedPrompt = `${selectedResource ?? ""} ${userPrompt}`;
      setCurrentStep("Analyzing resource requirements");
      await simulateProgress(30);
      setCurrentStep("Creating cloud resource");
      const result = await createCloudResource({ prompt: updatedPrompt });
      await simulateProgress(100);

      setCurrentStep("Complete");

      if (result?.terraform_code) {
        setTerraformCode(result.terraform_code);
        setContextTerraformCode(result.terraform_code);
        setResourceCreated(true);
      }

      toast({
        title: "Resource Created",
        description: "The cloud resource has been successfully created.",
      });

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
    <Layout promptHistory={[]}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Resource Creation
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Select a cloud resource type and describe the parameters to generate Terraform code.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700">
                <SelectValue placeholder="Choose a resource type..." />
              </SelectTrigger>
              <SelectContent className="border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
                <SelectItem value="Create s3 bucket">S3 Bucket</SelectItem>
                <SelectItem value="Create ec2 instance">EC2 Instance</SelectItem>
                <SelectItem value="Create rds database">RDS Database</SelectItem>
                <SelectItem value="Create lambda function">Lambda Function</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Please specify parameters e.g., with public access disabled"
              className="min-h-[100px] border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={isProcessing}
            />
          </CardContent>
          <CardFooter className="p-6 flex justify-end">
            <Button
              onClick={handleCreateResource}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              {isProcessing ? "Processing..." : "Create Resource"}
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
      </div>
    </Layout>
  );
};

export default ResourceCreationPage;