import { toast } from "@/hooks/use-toast";

// Base API URL
const API_URL = "http://localhost:8000";

// Helper for handling errors in fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error: ${response.status}`);
  }
  
  // Check if response is JSON or other format
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response;
};

export const onboardCloud = async (cloudData: any) => {
  try {
    // Format the payload according to the expected structure
    const formattedData = {
      cloud_provider: cloudData.cloud_provider,
    };
    
    // Add provider-specific fields
    if (cloudData.cloud_provider === 'aws') {
      formattedData['aws_access_key'] = cloudData.credentials.accessKey;
      formattedData['aws_secret_key'] = cloudData.credentials.secretKey;
      formattedData['aws_region'] = cloudData.credentials.region;
    } else if (cloudData.cloud_provider === 'azure') {
      // Azure specific mappings
      formattedData['azure_tenant_id'] = cloudData.credentials.tenantId;
      formattedData['azure_client_id'] = cloudData.credentials.clientId;
      formattedData['azure_client_secret'] = cloudData.credentials.clientSecret;
      formattedData['azure_subscription_id'] = cloudData.credentials.subscriptionId;
    } else if (cloudData.cloud_provider === 'gcp') {
      // GCP specific mappings
      formattedData['gcp_project_id'] = cloudData.credentials.projectId;
      formattedData['gcp_service_account_key'] = cloudData.credentials.serviceAccountKey;
      formattedData['gcp_region'] = cloudData.credentials.region;
    } else if (cloudData.cloud_provider === 'ibm') {
      // IBM specific mappings
      formattedData['ibm_api_key'] = cloudData.credentials.apiKey;
      formattedData['ibm_region'] = cloudData.credentials.region;
    }
    
    console.log("Sending onboard request:", formattedData);
    
    const response = await fetch(`${API_URL}/onboard_cloud`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
      // Prevent redirect following
      redirect: "manual"
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("Cloud onboarding error:", error);
    toast({
      title: "Cloud Onboarding Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const createCloudResource = async (resourceData: any) => {
  try {
    console.log("Sending resource creation request:", resourceData);

    const response = await fetch(`${API_URL}/create_resource`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resourceData),
      redirect: "manual",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Resource creation error:", error);
    toast({
      title: "Resource Creation Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const runComplianceScan = async (scanData: any) => {
  try {
    console.log("Sending compliance scan request:", scanData);
    
    const response = await fetch(`${API_URL}/run_compliance_scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scanData),
      // Prevent redirect following
      redirect: "manual"
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("Compliance scan error:", error);
    toast({
      title: "Compliance Scan Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadComplianceReport = async () => {
  try {
    console.log("Downloading compliance report");
    
    const response = await fetch(`${API_URL}/download_compliance_report/`, {
      method: "GET",
      // Prevent redirect following
      redirect: "manual"
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Return the blob for frontend to handle download
    return await response.blob();
  } catch (error) {
    console.error("Report download error:", error);
    toast({
      title: "Report Download Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const emailComplianceReport = async (emailData: { recipient_email: string }) => {
  try {
    console.log("Sending email request with data:", emailData);

    const response = await fetch(`${API_URL}/email_compliance_report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
      redirect: "manual",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Email sending error:", error);
    toast({
      title: "Email Send Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const listComplianceReports = async () => {
  try {
    console.log("Fetching compliance reports list");

    const response = await fetch(`${API_URL}/list_compliance_reports`, {
      method: "GET",
      redirect: "manual",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching compliance reports list:", error);
    toast({
      title: "Failed to Fetch Reports List",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadS3ComplianceReport = async (reportName: string) => {
  try {
    console.log(`Downloading S3 compliance report: ${reportName}`);

    const response = await fetch(`${API_URL}/download_s3_compliance_report/${reportName}`, {
      method: "GET",
      redirect: "manual"
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Return the blob for frontend to handle download
    return await response.blob();
  } catch (error) {
    console.error("S3 Report download error:", error);
    toast({
      title: "S3 Report Download Failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};
