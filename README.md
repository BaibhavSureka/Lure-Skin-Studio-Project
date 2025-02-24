# Switching from Twilio SMS to WhatsApp Messaging

This guide explains how to replace Twilio SMS notifications with WhatsApp messaging in the webhook responsible for handling payment confirmations.

## 1. Set Up WhatsApp API

To send messages via WhatsApp, follow these steps:

### Step 1: Create a Meta Developer Account
- Complete the GST verification for setting up payment method for the account

### Step 2: Mangaing Templates
- Modify or change the required templates from Whatsapp Mangaer

### Step 3: Remove Twilio SMS Sending Code
- Comment out the twilio code
- Un-Comment the whatsapp code

### Step 4: Define WhatsApp Variables
Ensure the following variables are properly set up:
```javascript
const whatsappId = "YOUR_WHATSAPP_PHONE_NUMBER_ID";
const whatsappToken = "YOUR_PERMANENT_ACCESS_TOKEN";
```

## 5. Reverting Back to Twilio
If needed, restore the original Twilio SMS code and remove the WhatsApp API implementation.

This completes the switch from **Twilio SMS to WhatsApp messaging**. 🚀

