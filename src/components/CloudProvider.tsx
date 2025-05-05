import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CloudProviderProps {
  selectedCloud: string;
  setSelectedCloud: (cloud: string) => void;
}

const CloudProvider = ({ selectedCloud, setSelectedCloud }: CloudProviderProps) => {
  const cloudProviders = [
    { id: "aws", name: "AWS", logo: "/cloud-aws.svg" },
    { id: "azure", name: "Azure", logo: "/cloud-azure.svg" },
    { id: "gcp", name: "Google Cloud", logo: "/cloud-gcp.svg" },
    { id: "ibm", name: "IBM Cloud", logo: "/cloud-ibm.svg" },
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Cloud Provider</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cloudProviders.map((provider) => (
          <Card
            key={provider.id}
            className={cn(
              "flex flex-col items-center justify-center p-4 cursor-pointer border transition-all",
              selectedCloud === provider.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "hover:border-gray-300 hover:bg-gray-50"
            )}
            onClick={() => setSelectedCloud(provider.id)}
          >
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              {/* In a real app, replace with actual logos */}
              <span className="text-xs font-bold">{provider.name.charAt(0)}</span>
            </div>
            <span className="text-sm">{provider.name}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CloudProvider;
