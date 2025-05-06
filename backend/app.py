import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import logging
import os
from onboarding_cloud import router as onboard_cloud_router  # Import your onboarding router
from compliance import create_terraform_resource, handle_compliance  # Import your compliance function
from pydantic import BaseModel
from email.message import EmailMessage
import smtplib

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

ticket_counter = 0
# CORS settings
# CORS settings
origins = [
    "http://localhost:3000",  # React dev server
    "http://localhost:8080",
    # Add production domain here later, e.g., "https://your-frontend.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
)

# Basic logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("cis_api_scanner_logs.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)


class EmailRequest(BaseModel):
    recipient_email: str


class ResourceProvisionRequest(BaseModel):
    prompt: str


class ComplianceRequest(BaseModel):
    prompt: str


# Include the onboarding router
app.include_router(onboard_cloud_router, prefix="/onboard_cloud", tags=["Onboarding"])


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-powered Cloud Compliance Automation API!"}


@app.post("/create_resource")
async def create_resource(request: ResourceProvisionRequest):
    try:
        prompt = request.prompt

        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

        result = await create_terraform_resource(prompt)

        return JSONResponse(content={"terraform_code": result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to trigger compliance scan
@app.post("/run_compliance_scan")
async def run_compliance_scan(request: ComplianceRequest):
    try:
        prompt = request.prompt

        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

        # Call the compliance handling function
        result_msg, xlsx_path = await handle_compliance(prompt)

        return {
            "message": result_msg,
            "report_path": xlsx_path  # (optional) You are returning xlsx_path if needed
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to download generated PDF report
@app.get("/download_compliance_report/")
async def download_compliance_report():
    pdf_path = "cis_compliance_report.pdf"  # generated PDF file

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")

    return FileResponse(
        path=pdf_path,
        filename="cis_compliance_report.pdf",
        media_type="application/pdf"
    )


# (Optional) Endpoint to download XLSX compliance overview if you want
@app.get("/download_compliance_xlsx/")
async def download_compliance_xlsx():
    xlsx_path = "Compliance_Overview.xlsx"  # generated XLSX file

    if not os.path.exists(xlsx_path):
        raise HTTPException(status_code=404, detail="Compliance overview XLSX not found.")

    return FileResponse(
        path=xlsx_path,
        filename="Compliance_Overview.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.post("/email_compliance_report")
async def email_compliance_report(request: EmailRequest):
    recipient_emails = [email.strip() for email in request.recipient_email.split(",")]
    pdf_path = "cis_compliance_report.pdf"

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")

    try:
        msg = EmailMessage()
        msg["Subject"] = "CIS Compliance Report"
        msg["From"] = os.getenv("SENDER_EMAIL")
        msg["To"] = ", ".join(recipient_emails)
        msg.set_content("Please find attached the CIS Compliance Report.")

        with open(pdf_path, "rb") as f:
            file_data = f.read()
            file_name = os.path.basename(pdf_path)
            msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=file_name)

        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
            server.starttls()
            server.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)

        return {"message": f"Email sent to {', '.join(recipient_emails)} successfully."}

    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email.")


@app.post("/support_email")
async def support_email(
    user_email: str = Form(...),
    subject: str = Form(...),
    message_body: str = Form(...)
):
    global ticket_counter
    try:
        ticket_counter += 1
        timestamp = int(time.time())
        ticket_id = f"NEOTICKET-{ticket_counter}-{timestamp}"

        msg = EmailMessage()
        msg["Subject"] = f"[{ticket_id}] {subject}"
        msg["From"] = os.getenv("SMTP_USERNAME")
        msg["To"] = os.getenv("SMTP_USERNAME", os.getenv("SMTP_USERNAME"))
        msg["Reply-To"] = user_email
        msg.set_content(
            f"Support Ticket ID: {ticket_id}\n\nFrom: {user_email}\n\nQuery:\n{message_body}"
        )

        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as smtp:
            smtp.starttls()
            smtp.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            smtp.send_message(msg)

        return {
            "message": "Support email sent successfully. Our team will get back to you soon.",
            "ticket_id": ticket_id
        }

    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
