import datetime
import logging
import os
import boto3
from dotenv import load_dotenv
from botocore.exceptions import ClientError
from botocore.client import Config


# Load environment variables from .env file
load_dotenv()

# Setup basic logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class S3Utils:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_DEFAULT_REGION'),
            config=Config(signature_version='s3v4')
        )

    def list_files(self, bucket_name: str, prefix: str = ""):
        """List files in an S3 bucket under the given prefix."""
        logging.info(f"Listing files in bucket '{bucket_name}' with prefix '{prefix}'...")
        try:
            response = self.s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
            files = [obj['Key'] for obj in response.get('Contents', [])]
            logging.info(f"Found {len(files)} files.")
            return files
        except ClientError as e:
            logging.error(f"Error listing files in bucket '{bucket_name}': {e}")
            return []

    def download_file(self, bucket_name: str, s3_key: str, local_path: str):
        """Download a file from S3 to a local path."""
        logging.info(f"Downloading {s3_key} from bucket '{bucket_name}' to {local_path}...")
        try:
            self.s3.download_file(bucket_name, s3_key, local_path)
            logging.info(f"Successfully downloaded {s3_key} to {local_path}.")
            return True
        except ClientError as e:
            logging.error(f"Error downloading file '{s3_key}' from bucket '{bucket_name}': {e}")
            return False

    def upload_file(self, local_path: str, bucket_name: str, s3_key: str):
        """Upload a file from a local path to S3."""
        logging.info(f"Uploading {local_path} to bucket '{bucket_name}' with key '{s3_key}'...")
        try:
            self.s3.upload_file(local_path, bucket_name, s3_key)
            logging.info(f"Successfully uploaded {local_path} to s3://{bucket_name}/{s3_key}.")
            return True
        except ClientError as e:
            logging.error(f"Error uploading file '{local_path}' to bucket '{bucket_name}': {e}")
            return False

    def generate_presigned_url(self, bucket_name: str, s3_key: str, expiration: int = 3600, disposition: str = 'inline'):
        """Generate a presigned URL to view an S3 PDF object in browser"""
        try:
            response = self.s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': s3_key,
                    'ResponseContentType': 'application/pdf',
                    'ResponseContentDisposition': disposition  # 👈 Key part
                },
                ExpiresIn=expiration
            )
        except ClientError as e:
            logging.error(f"Error generating presigned URL for '{s3_key}': {e}")
            return None

        return response



    def cleanup_old_files(self, bucket_name: str, prefix: str, days: int = 5):
        """Clean up S3 files older than a certain number of days."""
        logging.info(f"Cleaning up files older than {days} days in bucket '{bucket_name}' under prefix '{prefix}'...")
        try:
            # List the files in the given S3 bucket and prefix
            response = self.s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
            if 'Contents' not in response:
                logging.info(f"No files found under prefix '{prefix}' in bucket '{bucket_name}'.")
                return

            # Calculate the cutoff date for files to delete (older than 'days' days)
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
            files_to_delete = []

            for obj in response['Contents']:
                last_modified = obj['LastModified']
                if last_modified < cutoff_date:
                    files_to_delete.append({'Key': obj['Key']})

            if files_to_delete:
                # Delete the old files
                logging.info(f"Deleting {len(files_to_delete)} files older than {days} days...")
                delete_response = self.s3.delete_objects(
                    Bucket=bucket_name,
                    Delete={'Objects': files_to_delete}
                )
                deleted_files = delete_response.get('Deleted', [])
                for file in deleted_files:
                    logging.info(f"✅ Successfully deleted {file['Key']}.")
            else:
                logging.info(f"No files older than {days} days found for deletion.")

        except ClientError as e:
            logging.error(f"Error while cleaning up files in bucket '{bucket_name}': {e}")
