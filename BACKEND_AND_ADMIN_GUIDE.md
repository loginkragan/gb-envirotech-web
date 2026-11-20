# GB ENVIROTECH - Backend Server & Admin CRM Guide

This document describes the complete production backend, REST API, persistent database, and Admin Lead CRM built for **GB ENVIROTECH**.

---

## 1. Quick Start (Run Locally on Windows)

You have two convenient ways to start the backend server on your computer:

### Option A: 1-Click Launch (Recommended)
1. Open your Desktop folder: `C:\Users\abhim\Desktop\gb-envirotech-web\`
2. Double-click **`start-server.bat`**
3. A command window will launch, showing:
   ```
   ===========================================================
   🌱 GB ENVIROTECH - Production Backend Online
   ===========================================================
   - Website URL:      http://localhost:3000
   - Admin Lead CRM:   http://localhost:3000/admin
   - API Healthcheck:  http://localhost:3000/api/health
   - Admin Password:   GBEnviro@2026 (Change in .env)
   - Leads Storage:    data/leads.json
   ===========================================================
   ```
4. Open your web browser and go to:
   - **Main Website:** `http://localhost:3000`
   - **Admin CRM:** `http://localhost:3000/admin`

### Option B: Terminal Command
```powershell
cd C:\Users\abhim\Desktop\gb-envirotech-web
npm start
```

---

## 2. Admin Lead CRM (`/admin`)

Access the secure administrative portal at **`http://localhost:3000/admin`**.

- **Default Master Password:** `GBEnviro@2026` *(configurable in `.env`)*
- **Features Available:**
  - **Live Metrics Counter:** Real-time totals for Inquiries, Commercial RFQs, Total Plantlets Required, and Uncontacted Leads.
  - **Instant WhatsApp Quick-Chat:** Click the green WhatsApp button next to any lead to immediately open a pre-filled WhatsApp conversation with the customer referencing their exact Quotation ID.
  - **Instant Phone Calling:** One-click dialer for mobile or VoIP.
  - **Status Management:** Mark leads as `NEW`, `CONTACTED`, `QUOTED`, `IN_PRODUCTION`, or `DISPATCHED`.
  - **Search & Filter:** Search instantly by Customer Name, Phone, Crop (Banana G9, Pomegranate, etc.), State, or Lead ID.
  - **Export to CSV / Excel:** One-click download of all customer requirements for accounting, field agronomists, or tender filings.

---

## 3. How Leads & Quotations Flow

```
[Farmer / Institutional Buyer on Website]
                   │
                   ▼
[Fills "Request Bulk Quote" or "Spacing Calculator" Form]
                   │
                   ▼
       [POST /api/rfq to Express Server]
                   │
   ┌───────────────┴───────────────┐
   ▼                               ▼
[Saved to data/leads.json]  [Dispatched to Notification Engine]
(Persistent Database)       (Console, notifications.log, & SMTP)
   │
   ▼
[Client Receives Quotation Ref: GBE-2026-XXXX]
(Prompted to also continue conversation on WhatsApp)
   │
   ▼
[Appears Instantly in /admin Lead CRM]
```

---

## 4. Email Notification Configuration (`.env`)

By default, the server runs in **Local Log Mode**, safely saving every submission to `data/leads.json` and logging to `data/notifications.log`.

To have instant alert emails delivered to your sales inbox whenever a customer submits an inquiry, edit `.env`:

```ini
PORT=3000
ADMIN_PASSWORD=YourSecurePasswordHere
NOTIFICATION_EMAIL=sales@gbenvirotech.com

# Example: Using GoDaddy cPanel / Professional Business Email
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@gbenvirotech.com
SMTP_PASS=YourGoDaddyEmailPassword

# Or Example: Using Gmail SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=yourbusiness@gmail.com
# SMTP_PASS=your-google-app-password
```

---

## 5. Production Deployment (When Ready to Host Online)

When you are ready to publish `gbenvirotech.com` online with the live backend:

### Option 1: GoDaddy VPS / cPanel Node.js Application
1. In cPanel, navigate to **Setup Node.js App**.
2. Select Node version **18.x / 20.x / 22.x**.
3. Application Root: `public_html` (or your subdirectory).
4. Application Startup File: `server.js`.
5. Run `npm install` and click **Restart Application**.

### Option 2: 1-Click Cloud Hosting (Render / Railway)
- **Render:** Connect GitHub repo, select **Web Service**, Build Command: `npm install`, Start Command: `node server.js`.
- **Railway:** Connect repository and Railway automatically detects `server.js` and deploys instantly.
