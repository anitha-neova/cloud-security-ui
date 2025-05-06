import boto3
from botocore.exceptions import NoCredentialsError
import logging

# Initialize an S3 client
s3_client = boto3.client('s3')

def upload_file_to_s3(file_path: str, bucket_name: str, s3_key: str) -> bool:
    """Uploads a file to S3."""
    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        logging.info(f"✅ Successfully uploaded {file_path} to s3://{bucket_name}/{s3_key}")
        return True
    except Exception as e:
        logging.error(f"❌ Failed to upload {file_path} to S3: {e}")
        return False

def download_file_from_s3(local_file_path: str, bucket_name: str, s3_key: str) -> bool:
    """Downloads a file from S3."""
    try:
        s3_client.download_file(bucket_name, s3_key, local_file_path)
        logging.info(f"✅ Successfully downloaded {s3_key} from s3://{bucket_name} to {local_file_path}")
        return True
    except Exception as e:
        logging.error(f"❌ Failed to download {s3_key} from S3: {e}")
        return False

def list_files_in_s3_bucket(bucket_name: str, prefix: str):
    try:
        # List objects in the specified S3 bucket under a certain prefix
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

        # Check if there are any objects in the response
        if 'Contents' in response:
            # Extract only the filename from the full S3 object key
            file_names = [
                obj['Key'].split('/')[-1]  # Get the last part (filename) of the key
                for obj in response['Contents']
                if not obj['Key'].endswith('/')  # Exclude "directories"
            ]
            return file_names
        else:
            return []

    except NoCredentialsError:
        raise Exception("AWS credentials not found.")
    except Exception as e:
        raise Exception(f"Error while listing files in S3: {str(e)}")
