import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface CloudDetailsProps {
  cloudProvider: string;
  credentials: any;
  onDisconnect: () => void;
}

const CloudDetails = ({ cloudProvider, credentials, onDisconnect }: CloudDetailsProps) => {
  const { toast } = useToast();
  
  const getCloudColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "aws":
        return "bg-orange-500";
      case "azure":
        return "bg-blue-500";
      case "gcp":
        return "bg-red-500";
      case "ibm":
        return "bg-blue-700";
      default:
        return "bg-gray-500";
    }
  };
  
  const renderCredentialFields = () => {
    switch (cloudProvider.toLowerCase()) {
      case "aws":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-800">Region:</span>{" "}
              <span className="text-gray-600">{credentials.region}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Access Key:</span>{" "}
              <span className="text-gray-600">{credentials.accessKey.substring(0, 4)}...</span>
            </div>
          </div>
        );

      case "azure":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-800">Tenant ID:</span>{" "}
              <span className="text-gray-600">{credentials.tenantId.substring(0, 4)}...</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Subscription ID:</span>{" "}
              <span className="text-gray-600">{credentials.subscriptionId.substring(0, 4)}...</span>
            </div>
          </div>
        );

      case "gcp":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-800">Project ID:</span>{" "}
              <span className="text-gray-600">{credentials.projectId}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Region:</span>{" "}
              <span className="text-gray-600">{credentials.region}</span>
            </div>
          </div>
        );

      case "ibm":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-800">Region:</span>{" "}
              <span className="text-gray-600">{credentials.region}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleDisconnect = () => {
    toast({
      title: "Cloud Disconnected",
      description: `Successfully disconnected from ${cloudProvider.toUpperCase()}`,
    });
    onDisconnect();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-blue-50 rounded-xl shadow-md border-blue-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Connected Cloud Provider
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Currently connected to the following cloud provider
            </CardDescription>
          </div>
          <Badge
            className={`${getCloudColor(
              cloudProvider
            )} text-white rounded-full shadow-sm px-3 py-1`}
          >
            {cloudProvider.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Connection Details
            </h3>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              {renderCredentialFields()}
            </div>
          </div>

          <Separator className="border-blue-200 dark:border-gray-700" />

          <div className="flex justify-end">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 hover:scale-105"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudDetails;