import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CloudConnect from "@/components/CloudConnect";
import CloudDetails from "@/components/CloudDetails";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { onboardCloud } from "@/services/api";
import { useProgress } from "@/context/ProgressContext"; // 👈 USE CONTEXT

const CloudConnectionPage = () => {
  const [cloudProvider, setCloudProvider] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { setCloudConnected } = useProgress(); // 👈 USE CONTEXT

  const handleConnect = async (provider: string, creds: any) => {
    setIsConnecting(true);
    console.log("Attempting to connect to:", provider, "with credentials:", { ...creds, secretKey: creds.secretKey ? "***REDACTED***" : undefined });

    try {
      const response = await onboardCloud({
        cloud_provider: provider,
        credentials: creds
      });

      console.log("Cloud connection response:", response);

      setCloudProvider(provider);
      setCredentials(creds);

      // 👇 Update context after success
      setCloudConnected(true);

      toast({
        title: `${provider.toUpperCase()} Account Connected`,
        description: `Successfully connected to ${provider.toUpperCase()}`,
      });

      // Redirect to homepage after successful connection
      navigate("/dashboard");

    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : `Failed to connect to cloud provider ${provider.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setCloudProvider(null);
    setCredentials(null);
    setCloudConnected(false); // 👈 Update context
    toast({
      title: "Cloud Disconnected",
      description: "Successfully disconnected from cloud provider",
    });
  };

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>neoComplianceAgent | Connect To Cloud</title>
        </Helmet>
      <Header />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Cloud Connection</h1>
            {cloudProvider && (
              <Button onClick={() => navigate("/resource-creation")}>
                Go to Resource Creation
              </Button>
            )}
          </div>

          {cloudProvider && credentials ? (
            <CloudDetails
              cloudProvider={cloudProvider}
              credentials={credentials}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <CloudConnect onConnect={handleConnect} isConnecting={isConnecting} />
          )}

          <Alert>
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>
              Your cloud credentials are securely handled and neither stored on our servers nor in any AI model.
              All operations are performed client-side or through secure, temporary sessions.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  );
};

export default CloudConnectionPage;
