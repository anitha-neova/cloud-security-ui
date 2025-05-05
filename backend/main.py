import streamlit as st
from terraform_manager import TerraformManager
from dotenv import load_dotenv
import os
import asyncio
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


def handle_user_input():
    """Handles user input, runs Terraform, and performs CIS compliance analysis."""
    user_prompt = st.session_state.user_prompt.strip()

    if not user_prompt:
        st.warning("⚠️ Please enter a prompt.")
        return

    if "prompt_history" not in st.session_state:
        st.session_state.prompt_history = []

    st.session_state.prompt_history.append(user_prompt)

    terraform_manager = None
    compliance = None
    analyzer = None

    # Generate Terraform code
    try:
        st.info("🧠 Generating code...")
        terraform_manager = TerraformManager(os.getenv("OPENAI_API_KEY"))
        terraform_manager.generate_terraform_code(user_prompt)
    except Exception as e:
        st.error(f"❌ Failed to generate code: {e}")
        return

    # Execute Terraform
    try:
        st.info("🚀 Executing code to create resources...")
        terraform_manager.execute_terraform()
    except Exception as e:
        st.error(f"❌ Code execution failed: {e}")
        return

    # Run Compliance Scan
    try:
        st.info("🔍 Running compliance scan...")
        compliance = ComplianceManager(os.getenv("OPENAI_API_KEY"))
        compliance_data = asyncio.run(compliance.run_compliance_workflow(user_prompt))

        if compliance_data:
            st.success("✅ Compliance scan complete. JSON report saved.")
        else:
            st.error("❌ Compliance scan returned no data.")
            return
    except Exception as e:
        st.error(f"❌ Compliance scan failed: {e}")
        return

    # Analyze CIS Compliance
    try:
        st.info("📊 Analyzing CIS compliance...")
        analyzer = CISComplianceAnalyzer(os.getenv("OPENAI_API_KEY"))
        json_file = "Compliance_Overview.json"
        tf_file = "main.tf"

        result_msg, xlsx_path = analyzer.analyze_for_compliance_controls(json_file, tf_file)

        if xlsx_path and os.path.exists(xlsx_path):
            st.success(result_msg)
            pdf_path = "cis_compliance_report.pdf"
            if os.path.exists(pdf_path):
                with open(pdf_path, "rb") as f_pdf:
                    st.download_button(
                        label="📥 Download Compliance Report",
                        data=f_pdf,
                        file_name="cis_compliance_report.pdf",
                        mime="application/pdf"
                    )
        else:
            st.error("❌ CIS Compliance analysis failed or no report generated.")
    except Exception as e:
        st.error(f"❌ CIS Compliance analysis failed: {e}")

    # Destroy Terraform resources
    try:
        st.info("🧹 Initiating cleanup of cloud resources and temporary files...")
        if terraform_manager:
            terraform_manager.destroy_terraform()
        if compliance:
            compliance.cleanup_compliance_file()
        if analyzer:
            analyzer.cleanup_report_files()
        st.success("✅ Cleanup complete! All resources and files removed.")
    except Exception as e:
        st.error(f"❌ Failed to cleanup resources: {e}")

def main():
    """Main function to render the Streamlit UI."""
    if "prompt_history" not in st.session_state:
        st.session_state.prompt_history = []
    st.markdown(
        """
        <style>
        .footer {
            position: fixed;
            bottom: 0;
            left: 250px; /* adjust to match sidebar width */
            right: 0;
            background-color: #f9f9f9;
            text-align: center;
            padding: 10px;
            font-size: 0.75rem;
            color: gray;
            border-top: 1px solid #e0e0e0;
            z-index: 9999;
        }
        @media (max-width: 768px) {
            .footer {
                left: 0; /* remove offset on smaller screens */
            }
        }
        </style>

        <div class="footer">
            ⚠️ <strong>AI Disclaimer:</strong> This platform leverages AI models to assist with cloud resource creation and compliance analysis. While the AI is trained on industry best practices and standards, it may generate results that are incomplete, outdated, or inaccurate. All AI-generated Terraform configurations, compliance evaluations, and security findings must be manually reviewed and validated against the latest official documentation from cloud providers (e.g., AWS, Azure, GCP) and compliance authorities (e.g., CIS Benchmarks). Use of this tool does not guarantee full compliance or security. Final responsibility for implementation and adherence to security and compliance guidelines rests with the user.
        </div>
        """,
        unsafe_allow_html=True
    )
    col1, col2 = st.columns([0.8, 0.2])
    with col1:
        st.title("AI-Powered Cloud Compliance Automation")
        # st.warning("⚠️ AI can make mistakes. Please verify results against official documentation.")
    with col2:
        if os.path.exists(LOGO_PATHS["neova_solutions"]):
            st.image(LOGO_PATHS["neova_solutions"], width=100)

    st.text_input("How can I assist you?", key="user_prompt", on_change=handle_user_input)

    if st.button("Submit"):
        handle_user_input()

    st.sidebar.header("🔄 Prompt History")
    for past_prompt in st.session_state.prompt_history:
        cloud_logo = get_logo_for_cloud(past_prompt)
        col1, col2 = st.sidebar.columns([0.2, 0.8])
        if cloud_logo:
            col1.image(cloud_logo, width=30)
        col2.write(f"**{past_prompt}**")

if __name__ == "__main__":
    main()