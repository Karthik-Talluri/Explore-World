import urllib.request
import json
import time
import ssl
import datetime
import random

BASE_URL = "https://explore-world-inky.vercel.app"

# Bypasses local macOS SSL certificate verification errors
ssl_context = ssl._create_unverified_context()

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ssl_context) as res:
            res_data = res.read().decode("utf-8")
            return res.status, json.loads(res_data)
    except urllib.error.HTTPError as e:
        err_data = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_data)
        except Exception:
            return e.code, err_data

def run_test():
    print("--- STARTING E2E PORTAL FLOW TEST ---")

    # Step 1: Login as Traveller
    print("\n1. Logging in as Traveller (user@exploreworld.com)...")
    status, res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": "user@exploreworld.com",
        "password": "user123"
    })
    if status != 200:
        print(f"Failed traveller login: {status} - {res}")
        return
    traveller_token = res["token"]
    print("Traveller signed in successfully.")

    # Get available packages to get Kashmir ID
    status, pkgs = make_request(f"{BASE_URL}/api/packages")
    if status != 200:
        print(f"Failed to load packages: {status} - {pkgs}")
        return
    kashmir_pkg = next(p for p in pkgs if "jammu" in p["name"].lower() or "kashmir" in p["name"].lower())
    kashmir_pkg_id = kashmir_pkg["id"]
    print(f"Found Kashmir package ID: {kashmir_pkg_id}")

    # Generate a random travel date between 5 and 100 days in the future to ensure fresh scheduling slots
    offset_days = random.randint(5, 100)
    travel_date = (datetime.date.today() + datetime.timedelta(days=offset_days)).isoformat()
    print(f"Dynamic travel date generated: {travel_date} (Offset: {offset_days} days)")

    # Step 2: Book Kashmir Tour
    print("\n2. Booking Kashmir Tour package...")
    booking_payload = {
        "packageId": kashmir_pkg_id,
        "travelDate": travel_date,
        "travelersCount": 2,
        "roomType": "Suite",
        "specialRequests": "E2E Automated test run",
        "pickupLocation": "Srinagar Airport Gate 2",
        "contactNumber": "+1-555-9876",
        "paymentMethodId": "pm_card_success"
    }
    status, res = make_request(f"{BASE_URL}/api/bookings", method="POST", data=booking_payload, headers={
        "Authorization": f"Bearer {traveller_token}"
    })
    if status != 201:
        print(f"Failed booking: {status} - {res}")
        return
    booking = res["booking"]
    booking_id = booking["id"]
    print(f"Booking created. ID: {booking_id}, Invoice: {booking['invoiceId']}, Status: {booking['status']}")

    # Step 3: Get Traveller History & inspect assignment
    print("\n3. Verifying guide assignment in traveller history...")
    status, history = make_request(f"{BASE_URL}/api/bookings/history", headers={
        "Authorization": f"Bearer {traveller_token}"
    })
    if status != 200:
        print(f"Failed to fetch history: {status} - {history}")
        return
        
    my_booking = next(b for b in history if b["id"] == booking_id)
    
    if not my_booking.get("guideAssignment"):
        print("Error: No guide assignment linked to the booking!")
        return
    
    asg = my_booking["guideAssignment"]
    guide_name = asg["guide"]["user"]["name"]
    guide_email = asg["guide"]["user"]["email"]
    asg_status = asg["status"]
    asg_id = asg["id"]
    print(f"Assigned Guide: {guide_name} ({guide_email}), Status: {asg_status}")

    # Step 4: Login as the Assigned Guide
    print(f"\n4. Logging in as assigned guide: {guide_email}...")
    status, res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": guide_email,
        "password": "guide123"
    })
    if status != 200:
        print(f"Failed guide login: {status} - {res}")
        return
    guide_token = res["token"]
    print("Guide signed in successfully.")

    # Step 5: Guide Rejects the Assignment
    print("\n5. Guide rejecting the tour booking assignment...")
    status, res = make_request(f"{BASE_URL}/api/guide/assignments/{asg_id}/status", method="PUT", data={
        "status": "REJECTED"
    }, headers={
        "Authorization": f"Bearer {guide_token}"
    })
    if status != 200:
        print(f"Failed to reject assignment: {status} - {res}")
        return
    print("Assignment rejected successfully.")

    # Step 6: Verify reallocation in Traveller History
    print("\n6. Fetching traveller history to verify guide reallocation...")
    status, history = make_request(f"{BASE_URL}/api/bookings/history", headers={
        "Authorization": f"Bearer {traveller_token}"
    })
    if status != 200:
        print(f"Failed to fetch history: {status} - {history}")
        return
        
    my_booking = next(b for b in history if b["id"] == booking_id)
    
    new_asg = my_booking.get("guideAssignment")
    if not new_asg:
        print("Error: Reallocation failed, booking has no guide assignment!")
        return
    
    new_guide_name = new_asg["guide"]["user"]["name"]
    new_guide_email = new_asg["guide"]["user"]["email"]
    new_asg_status = new_asg["status"]
    new_asg_id = new_asg["id"]
    print(f"Reallocated Guide: {new_guide_name} ({new_guide_email}), Status: {new_asg_status}")

    if new_guide_email == guide_email:
        print("Error: Reassigned back to the same guide who rejected it!")
        return
    print("Success: Booking was successfully reallocated to the other available guide!")

    # Step 7: Login as the new Guide and Accept
    print(f"\n7. Logging in as reallocated guide: {new_guide_email}...")
    status, res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": new_guide_email,
        "password": "guide123"
    })
    if status != 200:
        print(f"Failed new guide login: {status} - {res}")
        return
    new_guide_token = res["token"]

    print("Accepting the booking assignment...")
    status, res = make_request(f"{BASE_URL}/api/guide/assignments/{new_asg_id}/status", method="PUT", data={
        "status": "ACCEPTED"
    }, headers={
        "Authorization": f"Bearer {new_guide_token}"
    })
    if status != 200:
        print(f"Failed to accept assignment: {status} - {res}")
        return
    print("Assignment accepted successfully.")

    # Step 8: Verify accepted status and contact details for traveller
    print("\n8. Verifying accepted guide details on traveller dashboard...")
    status, history = make_request(f"{BASE_URL}/api/bookings/history", headers={
        "Authorization": f"Bearer {traveller_token}"
    })
    if status != 200:
        print(f"Failed to fetch history: {status} - {history}")
        return
        
    my_booking = next(b for b in history if b["id"] == booking_id)
    final_asg = my_booking["guideAssignment"]
    print(f"Final Guide Name: {final_asg['guide']['user']['name']}")
    print(f"Final Guide Status: {final_asg['status']}")

    print("\n--- E2E PORTAL FLOW TEST COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_test()
