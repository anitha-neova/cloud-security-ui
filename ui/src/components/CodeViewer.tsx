import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardCopy, Download } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface CodeViewerProps {
  code: string;
  title?: string;
}

const CodeViewer = ({ code, title = "Generated Terraform Code" }: CodeViewerProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.tf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded",
      description: "The Terraform code has been downloaded as main.tf",
    });
  };

  return (
    <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
          {title}
        </CardTitle>
        <div className="flex gap-3">
          <Button
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200",
              copied && "bg-blue-600"
            )}
            size="default"
            onClick={copyToClipboard}
          >
            <ClipboardCopy className="h-5 w-5 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
            size="default"
            onClick={downloadCode}
          >
            <Download className="h-5 w-5 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          <pre className={cn(
            "p-6 rounded-lg bg-gray-900 text-gray-50 overflow-x-auto",
            "text-base font-mono"
          )}>
            <code>{code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeViewer;