import os
import requests
import logging
from requests.auth import HTTPBasicAuth

logger = logging.getLogger(__name__)

RAZORPAY_KEY = os.getenv("RAZORPAY_KEY_ID", "mock_key")
RAZORPAY_SECRET = os.getenv("RAZORPAY_SECRET", "mock_secret")

def create_payment_link(order_id, amount, customer_name, customer_phone, customer_email=""):
    """
    Creates a Razorpay Payment Link for the final agreed price of the order.
    """
    if "mock_" in RAZORPAY_KEY:
        logger.info(f"MOCK: Razorpay payment link created for order {order_id} at {amount}")
        return f"https://rzp.io/i/mock_{order_id}", f"plink_mock_{order_id}"

    url = "https://api.razorpay.com/v1/payment_links/"
    
    # Razorpay expects amount in paise (1 INR = 100 paise)
    amount_in_paise = int(amount * 100)
    
    payload = {
        "amount": amount_in_paise,
        "currency": "INR",
        "accept_partial": False,
        "reference_id": f"order_{order_id}",
        "description": f"EventDhara Final Payment for Order #{order_id}",
        "customer": {
            "name": customer_name or "EventDhara User",
            "contact": customer_phone or "",
            "email": customer_email or ""
        },
        "notify": {
            "sms": True, # Razorpay will send its own SMS if true
            "email": True
        },
        "reminder_enable": True
    }
    
    try:
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(RAZORPAY_KEY, RAZORPAY_SECRET), timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("short_url"), data.get("id")
        else:
            logger.error(f"Razorpay API Error: {response.text}")
            return None, response.text
    except Exception as e:
        logger.error(f"Exception during Razorpay Link creation: {str(e)}")
        return None, str(e)


def trigger_vendor_payout(payout_id):
    """
    Triggers a Razorpay Route transfer to the vendor's linked account.
    """
    from apps.payments.payments_all.models import Payout
    
    try:
        payout = Payout.objects.select_related('vendor').get(payout_id=payout_id)
    except Payout.DoesNotExist:
        return False, "Payout not found"

    if payout.status != 'pending':
        return False, f"Payout already in {payout.status} state"

    vendor_account = payout.vendor.razorpay_linked_account
    if not vendor_account:
        payout.status = 'failed'
        payout.failure_reason = "No Razorpay linked account for vendor"
        payout.save(update_fields=['status', 'failure_reason'])
        return False, payout.failure_reason

    amount_in_paise = int(payout.amount * 100)

    if "mock_" in RAZORPAY_KEY:
        logger.info(f"MOCK: Razorpay Route Transfer of {amount_in_paise} paise to {vendor_account}")
        payout.status = 'completed'
        payout.razorpay_payout_id = f"trf_mock_{payout.payout_id}"
        from django.utils import timezone
        payout.completed_at = timezone.now()
        payout.save()
        
        # update order status
        if payout.order:
            payout.order.status = 'paid_out'
            payout.order.payout_completed_at = payout.completed_at
            payout.order.save(update_fields=['status', 'payout_completed_at'])
            
        return True, payout.razorpay_payout_id

    url = "https://api.razorpay.com/v1/transfers"
    payload = {
        "account": vendor_account,
        "amount": amount_in_paise,
        "currency": "INR",
        "notes": {
            "order_id": str(payout.order_id) if payout.order else "N/A",
            "payout_id": str(payout.payout_id)
        }
    }

    try:
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(RAZORPAY_KEY, RAZORPAY_SECRET), timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            payout.status = 'completed'
            payout.razorpay_payout_id = data.get('id')
            from django.utils import timezone
            payout.completed_at = timezone.now()
            payout.save()
            
            if payout.order:
                payout.order.status = 'paid_out'
                payout.order.payout_completed_at = payout.completed_at
                payout.order.save(update_fields=['status', 'payout_completed_at'])
                
            return True, payout.razorpay_payout_id
        else:
            payout.status = 'failed'
            payout.failure_reason = str(response.text)
            payout.save(update_fields=['status', 'failure_reason'])
            logger.error(f"Razorpay Transfer Error: {response.text}")
            return False, response.text
            
    except Exception as e:
        payout.status = 'failed'
        payout.failure_reason = str(e)
        payout.save(update_fields=['status', 'failure_reason'])
        logger.error(f"Exception during Razorpay Transfer: {str(e)}")
        return False, str(e)


def create_linked_account(vendor_name, vendor_email, account_number, ifsc_code):
    """
    Creates a Linked Account under Razorpay Route for the Vendor to receive automated payouts.
    """
    if "mock_" in RAZORPAY_KEY:
        logger.info(f"MOCK: Created Linked Account for {vendor_name} ({account_number})")
        return "acc_mock_" + os.urandom(6).hex()

    url = "https://api.razorpay.com/beta/accounts"
    payload = {
        "email": vendor_email,
        "phone": "",
        "legal_business_name": vendor_name,
        "business_type": "individual",
        "contact_name": vendor_name,
        "profile": {
            "category": "services",
            "subcategory": "events"
        },
        "legal_info": {},
        "fund_accounts": [
            {
                "account_type": "bank_account",
                "bank_account": {
                    "name": vendor_name,
                    "ifsc": ifsc_code,
                    "account_number": account_number
                }
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(RAZORPAY_KEY, RAZORPAY_SECRET), timeout=10)
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            return data.get("id")
        else:
            logger.error(f"Razorpay Create Account Error: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Exception during Razorpay Account Creation: {str(e)}")
        return None

