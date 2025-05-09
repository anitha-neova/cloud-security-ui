import time
import logging
import os
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from passlib.context import CryptContext
from s3_utils import S3Utils

from onboarding_cloud import router as onboard_cloud_router  # Import your onboarding router
from compliance import create_terraform_resource, delete_reports, handle_compliance  # Import your compliance functions
import glob

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

async def get_current_user(token: str = Depends(oauth2_scheme)):
    email = verify_token(token)
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResourceProvisionRequest(BaseModel):
    prompt: str

class ComplianceRequest(BaseModel):
    prompt: str
    user_id: str

class EmailRequest(BaseModel):
    recipient_email: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str

app.include_router(onboard_cloud_router, prefix="/onboard_cloud", tags=["Onboarding"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-powered Cloud Compliance Automation API!"}

@app.post("/signup")
async def signup(user: SignupRequest):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email.")
    if user.role not in ["admin", "user", "compliance"]:
        raise HTTPException(status_code=400, detail="Invalid role.")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({"email": user.email, "password": hashed_password,"role": user.role})
    return {"message": "User created successfully!"}

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        user = users_collection.find_one({"email": request.email})
        if not user:
            logging.error(f"Password reset failed for {request.email}: User not found")
            raise HTTPException(status_code=404, detail="User not found")

        if not pwd_context.verify(request.current_password, user['password']):
            logging.error(f"Password reset failed for {request.email}: Invalid current password")
            raise HTTPException(status_code=400, detail="Invalid current password")

        if request.current_password == request.new_password:
            logging.error(f"Password reset failed for {request.email}: New password same as current")
            raise HTTPException(status_code=400, detail="New password cannot be the same as current password")

        password_regex = r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
        import re
        if not re.match(password_regex, request.new_password):
            logging.error(f"Password reset failed for {request.email}: New password does not meet requirements")
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (!@#$%^&*)"
            )

        hashed_new_password = pwd_context.hash(request.new_password)
        users_collection.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_new_password}}
        )
        logging.info(f"Password reset successful for {request.email}")
        return {"message": "Password reset successfully"}
    except Exception as e:
        logging.error(f"Error in reset_password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/admin_login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admins only.")
    token_data = {"sub": user["email"]}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"]),"role":"admin"}

@app.post("/login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    token_data = {"sub": user["email"]}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"])}

@app.post("/create_resource")
async def create_resource(request: ResourceProvisionRequest):
    try:
        await delete_reports()
        prompt = request.prompt
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        result = await create_terraform_resource(prompt)
        return JSONResponse(content={"terraform_code": result})
    except Exception as e:
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

        matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.pdf")
        if not matching_files:
            raise HTTPException(status_code=500, detail="Compliance report PDF not found.")
        pdf_path = max(matching_files, key=os.path.getmtime)
        pdf_filename = os.path.basename(pdf_path)

        s3 = S3Utils()
        s3_key = f"compliance-reports/{user_id}/{pdf_filename}"

        s3.upload_file(pdf_path, BUCKET_NAME, s3_key)
        return {
            "message": result_msg,
            "report_path": xlsx_path,
            "s3_url": f"s3://{BUCKET_NAME}/{s3_key}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download_compliance_report/")
async def download_compliance_report():
    # Find the matching report PDF
    matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.pdf")
    if not matching_files:
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")

    # Pick the most recent one
    pdf_path = max(matching_files, key=os.path.getmtime)
    pdf_filename = os.path.basename(pdf_path)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
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
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")

    # Pick the most recent one
    xlsx_path = max(matching_files, key=os.path.getmtime)
    xlsx_filename = os.path.basename(xlsx_path)
    if not os.path.exists(xlsx_path):
        raise HTTPException(status_code=404, detail="Compliance overview XLSX not found.")
    return FileResponse(
        path=xlsx_path,
        filename=xlsx_filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.post("/email_compliance_report")
async def email_compliance_report(request: EmailRequest):
    try:
        recipient_emails = [email.strip() for email in request.recipient_email.split(",")]
        matching_files = glob.glob("./neoComplianceAgent_compliance_report_*.pdf")
        if not matching_files:
            logging.error("No compliance report PDF files found for emailing")
            raise HTTPException(status_code=404, detail="Compliance report PDF not found.")

        pdf_path = max(matching_files, key=os.path.getmtime)
        pdf_filename = os.path.basename(pdf_path)
        if not os.path.exists(pdf_path):
            logging.error(f"Compliance report XLSX not found at {pdf_path}")
            raise HTTPException(status_code=404, detail="Compliance report XLSX not found.")

        logging.info(f"Sending compliance report XLSX: {pdf_path} to {', '.join(recipient_emails)}")
        msg = EmailMessage()
        msg["Subject"] = f"neoComplianceAgent Report – {pdf_filename}"
        msg["From"] = os.getenv("SENDER_EMAIL")
        msg["To"] = ", ".join(recipient_emails)
        msg.set_content("Please find attached the neoComplianceAgent Compliance Report (Excel).")

        with open(pdf_path, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype="application",
                subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=pdf_filename
            )

        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
            server.starttls()
            server.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)

        logging.info(f"Email sent to {', '.join(recipient_emails)} successfully")
        return {"message": f"Email sent to {', '.join(recipient_emails)} successfully."}
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
        ticket_id = f"neoComplianceAgent_SUPPORT_{ticket_counter}_{timestamp}"

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

        return JSONResponse(content={"files": files})

    except Exception as e:
        logging.error(f"❌ Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list compliance reports.")


@app.post("/ask_admin")
async def ask_admin(
        user_email: str = Form(...),
        subject: str = Form(...),
        inquiry_body: str = Form(...)
):
    global inquiry_counter
    try:
        inquiry_counter += 1
        timestamp = int(time.time())
        inquiry_id = f"neoComplianceAgent_INQ_{inquiry_counter}_{timestamp}"

        msg = EmailMessage()
        msg["Subject"] = f"[{inquiry_id}] {subject}"
        msg["From"] = os.getenv("SMTP_USERNAME")
        msg["To"] = os.getenv("SMTP_USERNAME")
        msg["Reply-To"] = user_email
        msg.set_content(
            f"Inquiry ID: {inquiry_id}\n\nFrom: {user_email}\n\nMessage:\n{inquiry_body}"
        )

        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as smtp:
            smtp.starttls()
            smtp.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            smtp.send_message(msg)

        return {
            "message": "Inquiry sent successfully. Our team will respond shortly.",
            "inquiry_id": inquiry_id
        }

    except Exception as e:
        logging.error(f"Failed to send inquiry email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send inquiry email: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)