import subprocess
import os
import shutil
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
#client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Define Terraform working directory
TERRAFORM_WORKING_DIR = os.getcwd()


class TerraformManager:
    def __init__(self, openai_key: str):
        self.client = OpenAI(api_key=openai_key)

    @staticmethod
    def is_terraform_installed() -> bool:
        """Checks if Terraform is installed on the system."""
        try:
            subprocess.run(["terraform", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return True
        except (FileNotFoundError, subprocess.CalledProcessError):
            logging.error("Terraform is not installed or not accessible. Please install Terraform and try again.")
            return False

    def execute_terraform(self):
        """Executes Terraform initialization and applies the configuration."""
        if not self.is_terraform_installed():
            return

        try:
            logging.info("Initializing Resource Creation...")
            subprocess.run(["terraform", "init"], check=True, text=True, cwd=TERRAFORM_WORKING_DIR)

            logging.info("Applying Resource Creation...")
            apply_result = subprocess.run(["terraform", "apply", "-auto-approve"], check=True, text=True, cwd=TERRAFORM_WORKING_DIR)

            if apply_result.returncode == 0:
                logging.info("✅ Resource created successfully")
            else:
                logging.error("Error applying resource configuration.")
        except subprocess.CalledProcessError as e:
            logging.error(f"Resource execution error: {e.stderr if e.stderr else 'No error output available'}")

    def destroy_terraform(self):
        try:
            logging.info("Destroying resource configuration...")
            apply_result = subprocess.run(["terraform", "destroy", "-auto-approve"], check=True, text=True, cwd=TERRAFORM_WORKING_DIR)

            if apply_result.returncode == 0:
                logging.info("✅ Resource destroyed successfully")
            else:
                logging.error("Error destroying resource configuration.")
        except subprocess.CalledProcessError as e:
            logging.error(f"Terraform execution error: {e.stderr if e.stderr else 'No error output available'}")

        self.cleanup_terraform_artifacts()

    @staticmethod
    def cleanup_terraform_artifacts():
        """Removes Terraform-generated files to maintain a clean working directory."""
        try:
            for file_or_dir in [".terraform", ".terraform.lock.hcl", "terraform.tfstate"]:
                path = os.path.join(TERRAFORM_WORKING_DIR, file_or_dir)
                if os.path.isdir(path):
                    shutil.rmtree(path)
                elif os.path.isfile(path):
                    os.remove(path)
        except Exception as e:
            logging.error(f"⚠️ Error during cleanup: {str(e)}")

    def generate_terraform_code(self, user_prompt: str):
        skip_execution = should_skip_terraform_execution(user_prompt)

        system_instruction = (
            "Generate only Terraform code based on the user's request. "
            "Do NOT include provisioner blocks, curl commands, scripts, or any execution logic. "
            "Only include infrastructure resources like aws_s3_bucket, aws_instance, etc."
        )

        response = self.client.chat.completions.create(
            model="ft:gpt-3.5-turbo-0125:neova-solutions::BNbxjepu",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ]
        )

        if response.choices:
            terraform_code = response.choices[0].message.content.strip()

            tf_file_path = os.path.join(TERRAFORM_WORKING_DIR, "main.tf")
            with open(tf_file_path, "w", encoding="utf-8") as file:
                file.write(terraform_code)

            format_terraform_code(tf_file_path)

            with open(tf_file_path, "r") as file:
                formatted_code = file.read()
            logging.info("✅ Code generated successfully!")
            logging.info(f"{formatted_code}")

        else:
            logging.error("❌ Failed to generate Terraform code.")

def should_skip_terraform_execution(prompt: str) -> bool:
    prompt = prompt.lower()
    code_only_keywords = ["give me", "show", "generate", "only code", "just code", "example", "without execution",
                          "no execution", "just generate"]
    return any(kw in prompt for kw in code_only_keywords)


def format_terraform_code(tf_file_path):
    """Formats the Terraform code using terraform fmt."""
    try:
        subprocess.run(["terraform", "fmt", tf_file_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        pass
