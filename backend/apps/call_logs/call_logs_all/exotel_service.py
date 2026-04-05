import os
import requests
import logging

logger = logging.getLogger(__name__)

EXOTEL_SID = os.getenv("EXOTEL_SID", "mock_sid")
EXOTEL_TOKEN = os.getenv("EXOTEL_TOKEN", "mock_token")
EXOTEL_SUBDOMAIN = os.getenv("EXOTEL_SUBDOMAIN", "api.exotel.com")
EXOTEL_CALLER_ID = os.getenv("EXOTEL_CALLER_ID", "080XXXXXXX") # Virtual Number / Relay Number

def initiate_masked_call(vendor_phone, client_phone):
    """
    Initiates a Click2Call request via Exotel.
    Calls the vendor first, then bridges the call to the client via a masked Relay Number.
    """
    if not vendor_phone or not client_phone:
        logger.error("Missing phone numbers for Click2Call")
        return False, "Missing phone numbers"
    
    # Strip non-numeric and ensure +91 standard (assuming India context based on project clues)
    v_phone = ''.join(filter(str.isdigit, vendor_phone))
    c_phone = ''.join(filter(str.isdigit, client_phone))
    
    url = f"https://{EXOTEL_SID}:{EXOTEL_TOKEN}@{EXOTEL_SUBDOMAIN}/v1/Accounts/{EXOTEL_SID}/Calls/connect.json"
    
    payload = {
        "From": v_phone,
        "To": c_phone,
        "CallerId": EXOTEL_CALLER_ID,
        "Record": "true", # Record calls for dispute resolution/quality
    }
    
    try:
        if "mock_" in EXOTEL_SID:
            logger.info(f"MOCK: Exotel call initiated from {v_phone} to {c_phone} via {EXOTEL_CALLER_ID}")
            return True, "MCK-" + os.urandom(8).hex()
            
        response = requests.post(url, data=payload, timeout=10)
        
        if response.status_code in [200, 201]:
            data = response.json()
            call_sid = data.get("Call", {}).get("Sid")
            return True, call_sid
        else:
            logger.error(f"Exotel API Error: {response.text}")
            return False, response.text
            
    except Exception as e:
        logger.error(f"Exception during Exotel Call: {str(e)}")
        return False, str(e)
