import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

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
        { id: "aws", name: "AWS", logo: "/aws_logo.png" },
        { id: "azure", name: "Azure", logo: "/azure_logo.jpeg" },
        { id: "gcp", name: "Google Cloud", logo: "/gcp_logo.png" },
        { id: "ibm", name: "IBM Cloud", logo: "/ibm_cloud_logo.jpeg" },
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
                                    <FormLabel className="font-semibold text-gray-800">Access Key</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter AWS Access Key" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Secret Key</FormLabel>
                                    <FormControl>
                                        <Input type="password" className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter AWS Secret Key" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Region</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="e.g., us-east-1" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Tenant ID</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter Azure Tenant ID" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Client ID</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter Azure Client ID" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Client Secret</FormLabel>
                                    <FormControl>
                                        <Input type="password" className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter Azure Client Secret" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Subscription ID</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter Azure Subscription ID" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Project ID</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter GCP Project ID" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Service Account Key</FormLabel>
                                    <FormControl>
                                        <Input type="password" className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter GCP Service Account Key" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Region</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="e.g., us-central1" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">API Key</FormLabel>
                                    <FormControl>
                                        <Input type="password" className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="Enter IBM Cloud API Key" {...field} />
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
                                    <FormLabel className="font-semibold text-gray-800">Region</FormLabel>
                                    <FormControl>
                                        <Input className="bg-white border-gray-200 focus:ring-blue-500 rounded-md" placeholder="e.g., us-south" {...field} />
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
        <Card className="w-full max-w-3xl mx-auto bg-blue-50 rounded-xl shadow-md border-blue-200">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">Connect to Cloud Provider</CardTitle>
                <CardDescription className="text-gray-600">
                    Enter your credentials to connect to your cloud provider
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Select Cloud Provider</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {cloudProviders.map((provider) => (
                            <Card
                                key={provider.id}
                                className={`flex flex-col items-center justify-center p-4 cursor-pointer border transition-all rounded-lg ${
                                    selectedCloud === provider.id
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 bg-white hover:shadow-md hover:bg-blue-50"
                                }`}
                                onClick={() => setSelectedCloud(provider.id)}
                            >
                                <img
                                    src={provider.logo}
                                    alt={`${provider.name} logo`}
                                    className="h-8 w-8 object-contain mb-2"
                                />
                                <span className="text-sm text-gray-800">{provider.name}</span>
                            </Card>
                        ))}
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {renderFields()}
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200" disabled={isConnecting}>
                            {isConnecting ? "Connecting..." : "Connect"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CloudConnect;