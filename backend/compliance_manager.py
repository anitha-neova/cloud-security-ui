import subprocess
import json
import logging
import asyncio
import re
import os
from openai import OpenAI

class ComplianceManager:
    def __init__(self, openai_key: str):
        self.client = OpenAI(api_key=openai_key)

    @staticmethod
    def sanitize_curl(curl_command: str) -> str:
        pattern = r"-d\s'({.*})'"
        match = re.search(pattern, curl_command)
        if match:
            json_part = match.group(1)
            escaped_json = json_part.replace('"', '\\"')
            curl_command = curl_command.replace(f"-d '{json_part}'", f'-d "{escaped_json}"')
        return curl_command

    async def ask_gpt(self, prompt: str) -> str:
        gpt_prompt = f"""
From the prompt below, extract and return the full cURL commands only (no markdown or code blocks), one per line.

Prompt:
{prompt}
"""
        logging.info("🧠 Sending prompt to AI...")
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": gpt_prompt}],
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()

    def run_curl(self, curl_command: str) -> str:
        try:
            curl_command = self.sanitize_curl(curl_command)
            logging.info(f"Running curl: {curl_command[:100]}...")
            result = subprocess.run(curl_command, shell=True, capture_output=True, text=True)
            if result.stderr:
                logging.warning(f"stderr: {result.stderr.strip()}")
            return result.stdout.strip()
        except Exception as e:
            logging.error(f"Error running curl API command: {e}")
            return ""

    async def extract_token_from_gpt(self, response_text: str) -> str:
        gpt_prompt = f"""
    You are a parser. From the JSON response below, extract and return ONLY the Bearer token string.
    Look for keys like "access_token", "token", or "access" — even if nested.
    Return ONLY the token string. No explanation, no formatting, no quotes, no extra text.

    Response:
    {response_text}
    """

        logging.info("🧠 Sending token API response to AI to extract bearer token...")
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": gpt_prompt}],
            temperature=0.2,
        )

        token = response.choices[0].message.content.strip().strip('"').strip()

        if re.match(r"^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*$", token):
            logging.info("🔐 Extracted token: Valid JWT format detected.")
        else:
            logging.warning("⚠️ Extracted token: Format may be invalid.")

        return token

    async def extract_scan_id_from_gpt(self, response_text: str) -> str:
        gpt_prompt = f"""
    From the response below, extract the 'scan_id'. If it's inside nested structures, follow the structure provided.

    Response:
    {response_text}
    """
        logging.info("Sending response to GPT to extract scan_id...")
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": gpt_prompt}],
            temperature=0.2,
        )
        scan_id = response.choices[0].message.content.strip()

        match = re.search(r"[a-f0-9\-]{36}", scan_id)
        if match:
            clean_scan_id = match.group(0)
            logging.info(f"Extracted Scan ID (cleaned): {clean_scan_id}")
            return clean_scan_id
        else:
            logging.error("❌ Invalid scan_id format.")
            return ""

    @staticmethod
    def replace_placeholder(command: str, token: str, scan_id: str = "") -> str:
        return command.replace("$BEARER_TOKEN", token).replace("SCAN_ID", scan_id)

    async def run_compliance_workflow(self, user_prompt: str):
        gpt_output = await self.ask_gpt(user_prompt)
        logging.info("✅ AI returned curl commands")

        curl_commands = [line.strip() for line in gpt_output.splitlines() if line.startswith("curl")]
        if len(curl_commands) < 1:
            logging.error("❌ No curl commands found. Expecting at least 1 for token.")
            return None

        token_response = self.run_curl(curl_commands[0])
        token = await self.extract_token_from_gpt(token_response)
        if not token:
            logging.error("❌ Bearer token not found. Exiting.")
            return
        logging.info(f"🔐 Token extracted - {token}")

        if len(curl_commands) >= 3:
            scan_command = self.replace_placeholder(curl_commands[1], token)
            scan_response = self.run_curl(scan_command)
            logging.info("🕵️ Scan triggered. Waiting 15 minutes before checking compliance...")
            # ⏱️ Wait for 15 minutes for scan to get successfully completed
            await asyncio.sleep(900)
            scan_id = await self.extract_scan_id_from_gpt(scan_response)
            if not scan_id:
                logging.error("❌ Scan ID not found. Exiting.")
                return
            logging.info(f"📦 Scan ID: {scan_id}")
            compliance_command = self.replace_placeholder(curl_commands[2], token, scan_id)

        elif len(curl_commands) == 2:
            compliance_command = self.replace_placeholder(curl_commands[1], token)
            # Try to extract scan_id from prompt if possible
            scan_id_match = re.search(r"[a-f0-9\-]{36}", compliance_command)
            scan_id = scan_id_match.group(0) if scan_id_match else "UNKNOWN"
            logging.info(f"📦 Using provided scan ID: {scan_id}")
        else:
            logging.error("❌ Not enough curl commands to continue.")
            return

        compliance_response = self.run_curl(compliance_command)

        try:
            data = json.loads(compliance_response)

            # ✅ Check for empty data
            if not data or "data" not in data or not data["data"]:
                logging.warning("⚠️ No compliance data present in the scan ID. Skipping report generation.")
                logging.error("❌ No data Found for compliance scan.")

            with open("Compliance_Overview.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            logging.info("📁 Compliance data saved to Compliance_Overview.json")
            return data
        except Exception as e:
            logging.error(f"❌ Failed to save compliance response: {e}")
            return None

    def cleanup_compliance_file(self):
        """Removes Compliance-generated files to maintain a clean working directory."""
        json_path = "Compliance_Overview.json"
        if os.path.exists(json_path):
            try:
                os.remove(json_path)
                logging.info(f"🗑️ Deleted temporary file: {json_path}")
            except Exception as e:
                logging.error(f"Failed to delete {json_path}: {e}")
