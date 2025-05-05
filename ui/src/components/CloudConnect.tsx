import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

interface CloudFormSchema {
  aws: {
    accessKey: string;
    secretKey: string;
    region: string;
  };
  azure: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    subscriptionId: string;
  };
  gcp: {
    projectId: string;
    serviceAccountKey: string;
    region: string;
  };
  ibm: {
    apiKey: string;
    region: string;
  };
}

const awsSchema = z.object({
  accessKey: z.string().min(1, "Access Key is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  region: z.string().min(1, "Region is required"),
});

const azureSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

const gcpSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  serviceAccountKey: z.string().min(1, "Service Account Key is required"),
  region: z.string().min(1, "Region is required"),
});

const ibmSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  region: z.string().min(1, "Region is required"),
});

type CloudConnectProps = {
  onConnect: (provider: string, credentials: any) => void;
  isConnecting?: boolean;
};

const CloudConnect = ({ onConnect, isConnecting = false }: CloudConnectProps) => {
  const [selectedCloud, setSelectedCloud] = useState("aws");
  const { toast } = useToast();
  
  const formSchemas = {
    aws: awsSchema,
    azure: azureSchema,
    gcp: gcpSchema,
    ibm: ibmSchema,
  };
  
  const form = useForm({
    resolver: zodResolver(formSchemas[selectedCloud as keyof typeof formSchemas]),
    defaultValues: {
      accessKey: "",
      secretKey: "",
      region: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
      subscriptionId: "",
      projectId: "",
      serviceAccountKey: "",
      apiKey: "",
    },
  });

  const onSubmit = (data: any) => {
    onConnect(selectedCloud, data);
  };

  const cloudProviders = [
    { id: "aws", name: "AWS", logo: "/cloud-aws.svg" },
    { id: "azure", name: "Azure", logo: "/cloud-azure.svg" },
    { id: "gcp", name: "Google Cloud", logo: "/cloud-gcp.svg" },
    { id: "ibm", name: "IBM Cloud", logo: "/cloud-ibm.svg" },
  ];

  const renderFields = () => {
    switch (selectedCloud) {
      case "aws":
        return (
          <>
            <FormField
              control={form.control}
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter AWS Access Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter AWS Secret Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "azure":
        return (
          <>
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Azure Tenant ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Azure Client ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Azure Client Secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subscriptionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Azure Subscription ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "gcp":
        return (
          <>
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GCP Project ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceAccountKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Account Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter GCP Service Account Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Paste the entire JSON service account key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., us-central1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "ibm":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter IBM Cloud API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., us-south" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Connect to Cloud Provider</CardTitle>
        <CardDescription>
          Enter your credentials to connect to your cloud provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Cloud Provider</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cloudProviders.map((provider) => (
              <Card
                key={provider.id}
                className={`flex flex-col items-center justify-center p-4 cursor-pointer border transition-all ${
                  selectedCloud === provider.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCloud(provider.id)}
              >
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xs font-bold">{provider.name.charAt(0)}</span>
                </div>
                <span className="text-sm">{provider.name}</span>
              </Card>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFields()}
            <Button type="submit" className="w-full" disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CloudConnect;
