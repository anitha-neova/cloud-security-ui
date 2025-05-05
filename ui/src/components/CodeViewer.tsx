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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCode}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className={cn(
            "p-4 rounded-md bg-gray-900 text-gray-50 overflow-x-auto",
            "text-sm font-mono"
          )}>
            <code>{code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeViewer;
