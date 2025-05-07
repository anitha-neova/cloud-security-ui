import os
import asyncio
from dotenv import load_dotenv
from terraform_manager import TerraformManager
from compliance_manager import ComplianceManager
from cis_analyzer import CISComplianceAnalyzer

# Load environment variables
load_dotenv()

LOGO_DIR = "logos"
LOGO_PATHS = {
    "aws": os.path.join(LOGO_DIR, "aws.png"),
    "azure": os.path.join(LOGO_DIR, "azure.png"),
    "gcp": os.path.join(LOGO_DIR, "gcp.png"),
    "ibm": os.path.join(LOGO_DIR, "ibm_cloud.png"),
    "neova_solutions": os.path.join(LOGO_DIR, "neova_solutions_logo.jpeg"),
}

def get_logo_for_cloud(prompt: str) -> str | None:
    """Returns the logo path corresponding to the cloud provider mentioned in the prompt."""
    prompt_lower = prompt.lower()
    for cloud, logo_path in LOGO_PATHS.items():
        if cloud in prompt_lower and os.path.exists(logo_path):
            return logo_path
    return None

async def create_terraform_resource(user_prompt: str):
    """Handles user input to generate and execute Terraform code."""
    terraform_manager = None

    if not user_prompt:
        raise ValueError("⚠️ Please enter a prompt.")

    tf_file_path = os.path.join(os.getcwd(), "main.tf")

    # Generate Terraform code
    try:
        terraform_manager = TerraformManager(os.getenv("OPENAI_API_KEY"))
        terraform_manager.generate_terraform_code(user_prompt)
    except Exception as e:
        raise Exception(f"❌ Failed to generate code: {e}")

    if not os.path.exists(tf_file_path):
        raise FileNotFoundError("❌ Terraform code file not found after generation.")

    with open(tf_file_path, "r", encoding="utf-8") as f:
        generated_code = f.read()

    # Execute Terraform
    try:
        terraform_manager.execute_terraform()
    except Exception as e:
        raise Exception(f"❌ Code execution failed: {e}")

    return generated_code

async def delete_reports():
    compliance = ComplianceManager(os.getenv("OPENAI_API_KEY"))
    analyzer = CISComplianceAnalyzer(os.getenv("OPENAI_API_KEY"))
    if compliance:
            compliance.cleanup_compliance_file()
    if analyzer:
        analyzer.cleanup_report_files()

async def handle_compliance(user_prompt: str):
    """Handles user input, runs Terraform, and performs CIS compliance analysis."""
    terraform_manager = None
    compliance = None
    analyzer = None

    # Run Compliance Scan
    try:
        compliance = ComplianceManager(os.getenv("OPENAI_API_KEY"))
        compliance_data = await compliance.run_compliance_workflow(user_prompt)

        if not compliance_data:
            raise Exception("❌ Compliance scan returned no data.")
    except Exception as e:
        raise Exception(f"❌ Compliance scan failed: {e}")

    # Analyze CIS Compliance
    try:
        analyzer = CISComplianceAnalyzer(os.getenv("OPENAI_API_KEY"))
        json_file = "Compliance_Overview.json"
        tf_file = "main.tf"
        result_msg, xlsx_path = analyzer.analyze_for_compliance_controls(json_file, tf_file)

        if not (xlsx_path and os.path.exists(xlsx_path)):
            raise Exception("❌ CIS Compliance analysis failed or no report generated.")
    except Exception as e:
        raise Exception(f"❌ CIS Compliance analysis failed: {e}")

    # Destroy Terraform resources
    try:
        terraform_manager = TerraformManager(os.getenv("OPENAI_API_KEY"))
        terraform_manager.destroy_terraform()
        if compliance:
            compliance.cleanup_compliance_file()
#        if analyzer:
#            analyzer.cleanup_report_files()
    except Exception as e:
        raise Exception(f"❌ Failed to cleanup resources: {e}")                         

    return result_msg, xlsx_path
