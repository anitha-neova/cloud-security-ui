import { Button } from "@/components/ui/button";
import { Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceReportProps {
  data: any;
  onDownload: () => void;
  onEmail: () => void;
}

const ComplianceReport = ({ data, onDownload, onEmail }: ComplianceReportProps) => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex-1" onClick={onEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </Button>
      </div>
    </div>
  );
};

export default ComplianceReport;
