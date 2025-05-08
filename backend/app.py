import glob
import logging
import os
import smtplib
import time
from datetime import datetime, timedelta
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient

from compliance import create_terraform_resource, delete_reports, handle_compliance
from onboarding_cloud import router as onboard_cloud_router
from s3_utils import S3Utils

# Load environment variables
load_dotenv()

BUCKET_NAME = "neova-cloudsec-ai"
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["neoComplianceAgent"]
users_collection = db['Users']
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ticket_counter = 0
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Initialize FastAPI app
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("cis_api_scanner_logs.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            logger.error("Token missing 'sub' field")
            raise HTTPException(status_code=401, detail="Invalid token: Missing email")
        if role is None:
            logger.error("Token missing 'role' field")
            raise HTTPException(status_code=401, detail="Invalid token: Missing role")
        user = users_collection.find_one({"email": email})
        if not user:
            logger.error(f"User not found for email: {email}")
            raise HTTPException(status_code=401, detail="User not found")
        logger.info(f"User authenticated: {email}, role: {role}")
        return {"email": email, "role": role, "user_id": str(user["_id"])}
    except JWTError as e:
        logger.error(f"JWT validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Created JWT for {data.get('sub')} with role {data.get('role')}")
    return encoded_jwt


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "non-admin"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str


class AdminResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class ResourceProvisionRequest(BaseModel):
    prompt: str


class ComplianceRequest(BaseModel):
    prompt: str
    user_id: str


class EmailRequest(BaseModel):
    recipient_email: str


app.include_router(onboard_cloud_router, prefix="/onboard_cloud", tags=["Onboarding"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-powered Cloud Compliance Automation API!"}


@app.post("/signup")
async def signup(user: SignupRequest):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email.")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password,
        "role": user.role
    })
    logger.info(f"User created: {user.email}, role: {user.role}")
    return {"message": "User created successfully!"}


@app.post("/users")
async def create_user(user: SignupRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email.")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password,
        "role": user.role
    })
    logger.info(f"Admin created user: {user.email}, role: {user.role}")
    return {"message": f"User {user.email} created successfully!"}


@app.post("/login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user:
        logger.error(f"Login failed for {login_request.email}: User not found")
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not pwd_context.verify(login_request.password, user['password']):
        logger.error(f"Login failed for {login_request.email}: Invalid password")
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token_data = {"sub": user["email"], "role": user.get("role", "non-admin")}
    access_token = create_access_token(token_data)
    logger.info(f"Login successful for {login_request.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "role": user.get("role", "non-admin")
    }


@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    user = users_collection.find_one({"email": request.email})
    if not user:
        logger.error(f"Reset password failed: User not found for {request.email}")
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(request.current_password, user['password']):
        logger.error(f"Reset password failed for {request.email}: Invalid current password")
        raise HTTPException(status_code=401, detail="Invalid current password")

    hashed_password = pwd_context.hash(request.new_password)
    users_collection.update_one(
        {"email": request.email},
        {"$set": {"password": hashed_password}}
    )
    logger.info(f"Password reset successful for {request.email}")
    return {"message": "Password reset successfully"}


@app.post("/admin/reset-password")
async def admin_reset_password(request: AdminResetPasswordRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        logger.error(f"User {current_user['email']} attempted admin password reset without admin role")
        raise HTTPException(status_code=403, detail="Only admins can reset other users' passwords")
    user = users_collection.find_one({"email": request.email})
    if not user:
        logger.error(f"User not found for admin password reset: {request.email}")
        raise HTTPException(status_code=404, detail="User not found")
    hashed_password = pwd_context.hash(request.new_password)
    users_collection.update_one(
        {"email": request.email},
        {"$set": {"password": hashed_password}}
    )
    logger.info(f"Admin reset password for {request.email}")
    return {"message": f"Password for {request.email} reset successfully"}


@app.post("/create_resource")
async def create_resource(request: ResourceProvisionRequest):
    try:
        await delete_reports()
        prompt = request.prompt
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        result = await create_terraform_resource(prompt)
        logger.info("Terraform resource created successfully")
        return JSONResponse(content={"terraform_code": result})
    except Exception as e:
        logger.error(f"Create resource failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/run_compliance_scan")
async def run_compliance_scan(request: ComplianceRequest):
    try:
        await delete_reports()
        prompt = request.prompt
        user_id = request.user_id
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        result_msg, xlsx_path = await handle_compliance(prompt)
        s3 = S3Utils()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        s3_key = f"compliance-reports/{user_id}/cis_compliance_report_{timestamp}.pdf"
        pdf_path = "cis_compliance_report.pdf"

        if not os.path.exists(pdf_path):
            logger.error("Compliance report PDF not found")
            raise HTTPException(status_code=500, detail="Compliance report PDF not found.")

        s3.upload_file(pdf_path, BUCKET_NAME, s3_key)
        logger.info(f"Compliance scan completed for user {user_id}, S3 key: {s3_key}")
        return {
            "message": result_msg,
            "report_path": xlsx_path,
            "s3_url": f"s3://{BUCKET_NAME}/{s3_key}"
        }
    except Exception as e:
        logger.error(f"Compliance scan failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download_compliance_report/")
async def download_compliance_report():
    matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.pdf")
    if not matching_files:
        logger.error("No compliance report PDFs found")
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
    pdf_path = max(matching_files, key=os.path.getmtime)
    pdf_filename = os.path.basename(pdf_path)
    if not os.path.exists(pdf_path):
        logger.error(f"Compliance report PDF not found: {pdf_path}")
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
    logger.info(f"Downloading compliance report: {pdf_filename}")
    return FileResponse(
        path=pdf_path,
        filename=pdf_filename,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{pdf_filename}"'}
    )


@app.get("/download_compliance_xlsx/")
async def download_compliance_xlsx():
    matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.xlsx")
    if not matching_files:
        logger.error("No compliance report XLSX files found")
        raise HTTPException(status_code=404, detail="Compliance report XLSX not found.")
    xlsx_path = max(matching_files, key=os.path.getmtime)
    xlsx_filename = os.path.basename(xlsx_path)
    if not os.path.exists(xlsx_path):
        logger.error(f"Compliance report XLSX not found: {xlsx_path}")
        raise HTTPException(status_code=404, detail="Compliance overview XLSX not found.")
    logger.info(f"Downloading compliance XLSX: {xlsx_filename}")
    return FileResponse(
        path=xlsx_path,
        filename=xlsx_filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.post("/email_compliance_report")
async def email_compliance_report(request: EmailRequest):
    recipient_emails = [email.strip() for email in request.recipient_email.split(",")]
    matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.pdf")
    if not matching_files:
        logger.error("No compliance report PDFs found for email")
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
    pdf_path = max(matching_files, key=os.path.getmtime)

    if not os.path.exists(pdf_path):
        logger.error(f"Compliance report PDF not found for email: {pdf_path}")
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
    try:
        msg = EmailMessage()
        msg["Subject"] = "neoComplianceAgent Report"
        msg["From"] = os.getenv("SENDER_EMAIL")
        msg["To"] = ", ".join(recipient_emails)
        msg.set_content("Please find attached AI Analyzed neoComplianceAgent Report.")
        with open(pdf_path, "rb") as f:
            msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename=os.path.basename(pdf_path))
        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
            server.starttls()
            server.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)
        logger.info(f"Compliance report emailed to {', '.join(recipient_emails)}")
        return {"message": f"Email sent to {', '.join(recipient_emails)} successfully."}
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
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
        ticket_id = f"neoComplianceAgent_{ticket_counter}_{timestamp}"

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


@app.get("/list_compliance_reports")
async def list_compliance_reports(user_id: str = Query(..., description="MongoDB user ID")):
    try:
        s3_prefix = f"compliance-reports/{user_id}/"
        s3 = S3Utils()
        file_keys = s3.list_files(BUCKET_NAME, s3_prefix)
        files = []
        for key in file_keys:
            view_url = s3.generate_presigned_url(BUCKET_NAME, key, disposition='inline')
            download_url = s3.generate_presigned_url(BUCKET_NAME, key, disposition='attachment')
            files.append({"s3_key": key, "view_url": view_url, "download_url": download_url})
        logger.info(f"Listed compliance reports for user {user_id}")
        return JSONResponse(content={"files": files})
    except Exception as e:
        logger.error(f"Error listing compliance reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list compliance reports.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)