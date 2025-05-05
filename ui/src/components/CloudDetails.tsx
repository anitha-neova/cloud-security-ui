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
              <span className="font-semibold">Region:</span> {credentials.region}
            </div>
            <div>
              <span className="font-semibold">Access Key:</span> {credentials.accessKey.substring(0, 4)}...
            </div>
          </div>
        );
        
      case "azure":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Tenant ID:</span> {credentials.tenantId.substring(0, 4)}...
            </div>
            <div>
              <span className="font-semibold">Subscription ID:</span> {credentials.subscriptionId.substring(0, 4)}...
            </div>
          </div>
        );
        
      case "gcp":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Project ID:</span> {credentials.projectId}
            </div>
            <div>
              <span className="font-semibold">Region:</span> {credentials.region}
            </div>
          </div>
        );
        
      case "ibm":
        return (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Region:</span> {credentials.region}
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Cloud Provider</CardTitle>
            <CardDescription>
              Currently connected to the following cloud provider
            </CardDescription>
          </div>
          <Badge className={`${getCloudColor(cloudProvider)} text-white`}>
            {cloudProvider.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Connection Details</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {renderCredentialFields()}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudDetails;