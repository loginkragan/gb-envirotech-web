# GoDaddy Domain Setup Guide for gbenvirotech.com

This guide provides exact step-by-step instructions for connecting your GoDaddy domain **gbenvirotech.com** to your live website.

---

## 1. Choose Your Hosting Platform

This website is built with clean, modern HTML5, Tailwind CSS, and client-side JavaScript. It can be hosted free with zero maintenance and automatic SSL (HTTPS) on:
- **Vercel** (Recommended for speed and Next.js / API scalability)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

---

## 2. Setting Up on Vercel (Recommended)

1. **Sign In:** Go to [vercel.com](https://vercel.com) and sign in (using GitHub or email).
2. **Deploy the Site:** 
   * Drag and drop the `gb-envirotech-web` folder, or connect your GitHub repository containing these files.
   * Click **Deploy**.
3. **Add Custom Domain:**
   * Go to **Project Settings** > **Domains**.
   * Enter `gbenvirotech.com` and `www.gbenvirotech.com`.
   * Vercel will show you the exact DNS records needed.

---

## 3. Configuring GoDaddy DNS Records

Log in to your **GoDaddy Account** -> **My Products** -> Click **DNS** next to `gbenvirotech.com`.

### Add/Update these Records in GoDaddy:

| Type | Name / Host | Value / Points To | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | 1/2 Hour (or Default) | Points root domain `gbenvirotech.com` to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | 1/2 Hour (or Default) | Points `www.gbenvirotech.com` to Vercel |

*(Note: If you choose Netlify instead of Vercel, Netlify will provide its own IP for the A record or CNAME `your-site.netlify.app`)*

---

## 4. Professional Business Email Setup (Google Workspace / Microsoft 365 / Zoho)

To use official emails like:
- `info@gbenvirotech.com`
- `sales@gbenvirotech.com`
- `drbains@gbenvirotech.com`

Add the MX records provided by your email provider in your GoDaddy DNS settings.
For example, for **Google Workspace**:
- **MX:** `@` -> `ASPMX.L.GOOGLE.COM` (Priority 1)
- **MX:** `@` -> `ALT1.ASPMX.L.GOOGLE.COM` (Priority 5)

---

## 5. Verification & SSL

* DNS propagation usually takes between **15 minutes to 24 hours**.
* The hosting platform will automatically generate a free, renewing **Let's Encrypt SSL Certificate** for `https://gbenvirotech.com`.
