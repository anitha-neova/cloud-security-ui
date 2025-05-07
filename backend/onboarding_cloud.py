import os
import subprocess
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Initialize the router for onboarding
router = APIRouter()

# Pydantic models for input validation
class OnboardCloudRequest(BaseModel):
    cloud_provider: str
    aws_access_key: str = None
    aws_secret_key: str = None
    aws_region: str = None
    gcp_project_id: str = None
    azure_client_id: str = None
    azure_client_secret: str = None
    azure_tenant_id: str = None
    gcp_credentials_path: str = None  # Path to the GCP service account JSON file

# Helper function to configure AWS CLI
def configure_aws_cli(aws_access_key: str, aws_secret_key: str, aws_region: str):
    try:
        os.environ['AWS_ACCESS_KEY_ID'] = aws_access_key
        os.environ['AWS_SECRET_ACCESS_KEY'] = aws_secret_key
        os.environ['AWS_DEFAULT_REGION'] = aws_region

        subprocess.run(f"aws configure set aws_access_key_id {aws_access_key}", shell=True, check=True)
        subprocess.run(f"aws configure set aws_secret_access_key {aws_secret_key}", shell=True, check=True)
        subprocess.run(f"aws configure set region {aws_region}", shell=True, check=True)

        logging.info("AWS CLI has been successfully configured.")
    except Exception as e:
        logging.error(f"Error configuring AWS CLI: {e}")
        raise HTTPException(status_code=500, detail="Error configuring AWS CLI.")

# Helper function to configure Azure CLI
def configure_azure_cli(client_id: str, client_secret: str, tenant_id: str):
    try:
        os.environ['AZURE_CLIENT_ID'] = client_id
        os.environ['AZURE_CLIENT_SECRET'] = client_secret
        os.environ['AZURE_TENANT_ID'] = tenant_id

        subprocess.run(f"az login --service-principal -u {client_id} -p {client_secret} --tenant {tenant_id}", shell=True, check=True)

        logging.info("Azure CLI has been successfully configured.")
    except Exception as e:
        logging.error(f"Error configuring Azure CLI: {e}")
        raise HTTPException(status_code=500, detail="Error configuring Azure CLI.")

# Helper function to configure GCP CLI
def configure_gcp_cli(gcp_credentials_path: str):
    try:
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = gcp_credentials_path

        subprocess.run(f"gcloud auth activate-service-account --key-file={gcp_credentials_path}", shell=True, check=True)

        logging.info("GCP CLI has been successfully configured.")
    except Exception as e:
        logging.error(f"Error configuring GCP CLI: {e}")
        raise HTTPException(status_code=500, detail="Error configuring GCP CLI.")

# Onboarding endpoint
@router.post("")
async def onboard_cloud(request: OnboardCloudRequest):
    try:
        if request.cloud_provider == "aws":
            if not all([request.aws_access_key, request.aws_secret_key, request.aws_region]):
                raise HTTPException(status_code=400, detail="Missing AWS credentials or region.")
            
            logging.info(f"Configuring AWS CLI with provided credentials...")
            configure_aws_cli(request.aws_access_key, request.aws_secret_key, request.aws_region)

            # Test the AWS CLI configuration by listing S3 buckets
            try:
                s3_response = subprocess.run("aws s3 ls", shell=True, capture_output=True, text=True)
                if s3_response.returncode != 0:
                    logging.error(f"AWS CLI error: {s3_response.stderr}")
                    raise HTTPException(status_code=500, detail="Error listing S3 buckets.")
                logging.info(f"Successfully listed S3 buckets: {s3_response.stdout}")
                return {"status": "success", "message": "AWS CLI is configured and working!"}
            except Exception as e:
                logging.error(f"Error testing AWS CLI: {e}")
                raise HTTPException(status_code=500, detail="Error running AWS CLI.")
        
        elif request.cloud_provider == "azure":
            if not all([request.azure_client_id, request.azure_client_secret, request.azure_tenant_id]):
                raise HTTPException(status_code=400, detail="Missing Azure credentials (Client ID, Secret, or Tenant ID).")

            logging.info(f"Configuring Azure CLI with provided credentials...")
            configure_azure_cli(request.azure_client_id, request.azure_client_secret, request.azure_tenant_id)

            # Test Azure CLI login by listing subscriptions
            try:
                azure_response = subprocess.run("az account list --output table", shell=True, capture_output=True, text=True)
                if azure_response.returncode != 0:
                    logging.error(f"Azure CLI error: {azure_response.stderr}")
                    raise HTTPException(status_code=500, detail="Error listing Azure subscriptions.")
                logging.info(f"Successfully listed Azure subscriptions: {azure_response.stdout}")
                return {"status": "success", "message": "Azure CLI is configured and working!"}
            except Exception as e:
                logging.error(f"Error testing Azure CLI: {e}")
                raise HTTPException(status_code=500, detail="Error running Azure CLI.")
        
        elif request.cloud_provider == "gcp":
            if not request.gcp_credentials_path:
                raise HTTPException(status_code=400, detail="Missing GCP credentials file path.")

            logging.info(f"Configuring GCP CLI with provided credentials...")
            configure_gcp_cli(request.gcp_credentials_path)

            # Test GCP CLI by listing projects
            try:
                gcp_response = subprocess.run("gcloud projects list", shell=True, capture_output=True, text=True)
                if gcp_response.returncode != 0:
                    logging.error(f"GCP CLI error: {gcp_response.stderr}")
                    raise HTTPException(status_code=500, detail="Error listing GCP projects.")
                logging.info(f"Successfully listed GCP projects: {gcp_response.stdout}")
                return {"status": "success", "message": "GCP CLI is configured and working!"}
            except Exception as e:
                logging.error(f"Error testing GCP CLI: {e}")
                raise HTTPException(status_code=500, detail="Error running GCP CLI.")
        
        else:
            raise HTTPException(status_code=400, detail="Cloud provider not supported.")

    except HTTPException as http_error:
        logging.error(f"HTTP error: {http_error.detail}")
        raise http_error
    except Exception as e:
        logging.error(f"Error onboarding cloud provider: {e}")
        raise HTTPException(status_code=500, detail="Error onboarding cloud provider.")
