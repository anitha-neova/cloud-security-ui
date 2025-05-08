import time
import logging
import os
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from passlib.context import CryptContext
from onboarding_cloud import router as onboard_cloud_router  # Import your onboarding router
from compliance import create_terraform_resource, delete_reports, handle_compliance  # Import your compliance functions

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["neoComplianceAgent"]
users_collection = db['Users']
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResourceProvisionRequest(BaseModel):
    prompt: str

class ComplianceRequest(BaseModel):
    prompt: str

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
    users_collection.insert_one({"email": user.email, "password": hashed_password})
    return {"message": "User created successfully!"}

@app.post("/login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    token_data = {"sub": user["email"]}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer"}

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
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        result_msg, xlsx_path = await handle_compliance(prompt)
        return {
            "message": result_msg,
            "report_path": xlsx_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download_compliance_report/")
async def download_compliance_report():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(BASE_DIR, "cis_compliance_report.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Compliance report PDF not found.")
    return FileResponse(
        path=pdf_path,
        filename="cis_compliance_report.pdf",
        media_type="application/pdf"
    )

@app.get("/download_compliance_xlsx/")
async def download_compliance_xlsx():
    xlsx_path = "Compliance_Overview.xlsx"
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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
