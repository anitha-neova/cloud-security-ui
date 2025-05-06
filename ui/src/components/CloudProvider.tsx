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
    <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
      <label className="block text-base font-semibold text-gray-800 dark:text-white mb-3">
        Cloud Provider
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cloudProviders.map((provider) => (
          <Card
            key={provider.id}
            className={cn(
              "flex flex-col items-center justify-center p-6 cursor-pointer border transition-all duration-200 rounded-lg",
              selectedCloud === provider.id
                ? "border-blue-500 bg-blue-50 shadow-md dark:bg-gray-700 dark:border-blue-400"
                : "border-gray-200 bg-white hover:shadow-lg hover:scale-105 dark:bg-gray-900 dark:border-gray-700"
            )}
            onClick={() => setSelectedCloud(provider.id)}
          >
            <div className="h-10 w-10 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
              <span className="text-sm font-bold text-blue-500 dark:text-blue-400">
                {provider.name.charAt(0)}
              </span>
            </div>
            <span className="text-base font-medium text-gray-800 dark:text-white">
              {provider.name}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CloudProvider;