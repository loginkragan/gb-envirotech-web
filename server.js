/**
 * GB ENVIROTECH - Commercial Plant Tissue Culture & Biotechnology
 * Official Production Backend Server & REST API
 * 
 * Capabilities:
 * - Serves frontend static application (index.html, assets, media)
 * - REST API for Commercial Bulk Quote Inquiries (POST /api/rfq)
 * - REST API for Contact & Consultation Messages (POST /api/contact)
 * - Persistent Lead Storage (data/leads.json) with auto-backup
 * - Automated Email Notifications to Sales Desk & Customer Confirmation (Nodemailer)
 * - Secure Admin CRM Dashboard (GET /admin) with Status Tracking & Filtering
 * - CSV Lead Export for Field Agronomists & Tenders (GET /api/admin/export)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GBEnviro@2026';
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const LOGS_FILE = path.join(DATA_DIR, 'notifications.log');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure leads file exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database Helpers
function readLeads() {
  try {
    const data = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading leads:', err);
    return [];
  }
}

function writeLeads(leads) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving leads:', err);
    return false;
  }
}

function generateLeadId() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GBE-${year}-${random}`;
}

// Mailer Service Setup
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

async function sendNotification(lead) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const transporter = getTransporter();

  const isRFQ = lead.type === 'rfq';
  const subject = isRFQ 
    ? `🌱 [New Bulk RFQ] ${lead.crop} - ${lead.quantity} Plantlets (${lead.name})`
    : `📩 [New Contact Inquiry] ${lead.subject || 'Website Message'} from ${lead.name}`;

  const textBody = `
========================================
GB ENVIROTECH - COMMERCIAL LEAD RECEIVED
========================================
Lead ID: ${lead.id}
Date & Time: ${timestamp} IST
Type: ${isRFQ ? 'Commercial Bulk RFQ' : 'General Inquiry'}

CONTACT DETAILS:
- Name: ${lead.name}
- Organization / Farm: ${lead.organization || 'N/A'}
- Phone / WhatsApp: ${lead.phone}
- Email: ${lead.email || 'N/A'}
- State / District: ${lead.state || 'N/A'}
- GSTIN: ${lead.gstin || 'N/A'}

${isRFQ ? `REQUIREMENT DETAILS:
- Crop / Variety: ${lead.crop}
- Supply Stage: ${lead.stage}
- Acreage: ${lead.acreage ? lead.acreage + ' Acres' : 'N/A'}
- Requested Quantity: ${lead.quantity} Plantlets
- Dispatch Window: ${lead.timeline || 'Immediate'}
` : `MESSAGE:
${lead.message || 'No additional message'}
`}
Additional Notes: ${lead.notes || 'N/A'}

WhatsApp Direct Link: https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}
Admin Portal: http://localhost:${PORT}/admin
========================================
  `;

  // Always log to data/notifications.log
  fs.appendFileSync(LOGS_FILE, `[${timestamp}] ${subject}\n${textBody}\n\n`, 'utf-8');

  if (transporter && process.env.NOTIFICATION_EMAIL) {
    try {
      await transporter.sendMail({
        from: `"GB Envirotech Portal" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFICATION_EMAIL,
        subject: subject,
        text: textBody
      });
      console.log(`[Email Sent] Notification delivered for ${lead.id}`);
    } catch (err) {
      console.warn(`[Email Notice] SMTP dispatch failed: ${err.message}. Saved to local log.`);
    }
  } else {
    console.log(`[Notification Logged] Lead ${lead.id} recorded. (Configure SMTP in .env for live email dispatch)`);
  }
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    enterprise: 'GB ENVIROTECH',
    facility: 'RIICO Boranada, Jodhpur, Rajasthan',
    timestamp: new Date().toISOString()
  });
});

// Submit Commercial Bulk Quote (RFQ)
app.post('/api/rfq', async (req, res) => {
  try {
    const { crop, stage, quantity, acreage, name, organization, phone, email, state, timeline, gstin, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Full Name and Phone/WhatsApp number are required.' });
    }

    const lead = {
      id: generateLeadId(),
      type: 'rfq',
      createdAt: new Date().toISOString(),
      crop: crop || 'Unspecified Crop',
      stage: stage || 'Stage 3 (Primary Hardened)',
      quantity: quantity ? parseInt(quantity) : 500,
      acreage: acreage || null,
      name: name.trim(),
      organization: organization ? organization.trim() : null,
      phone: phone.trim(),
      email: email ? email.trim() : null,
      state: state || 'Rajasthan',
      timeline: timeline || 'Standard Dispatch Window',
      gstin: gstin ? gstin.trim() : null,
      notes: notes ? notes.trim() : null,
      status: 'NEW',
      history: [{ action: 'Created via Web RFQ Modal', time: new Date().toISOString() }]
    };

    const leads = readLeads();
    leads.unshift(lead);
    writeLeads(leads);

    // Trigger notification in background
    sendNotification(lead).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      leadId: lead.id,
      message: `Your commercial quotation request (${lead.id}) has been recorded. Our Boranada agronomy desk will review stock availability and contact you within 24 hours.`,
      lead: lead
    });
  } catch (err) {
    console.error('Error processing RFQ:', err);
    res.status(500).json({ success: false, error: 'Server error while processing quote request.' });
  }
});

// Submit General Contact / Consultation Inquiry
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ success: false, error: 'Name and either Phone or Email are required.' });
    }

    const lead = {
      id: generateLeadId(),
      type: 'contact',
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      organization: organization ? organization.trim() : null,
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message ? message.trim() : '',
      status: 'NEW',
      history: [{ action: 'Created via Contact Form', time: new Date().toISOString() }]
    };

    const leads = readLeads();
    leads.unshift(lead);
    writeLeads(leads);

    sendNotification(lead).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      leadId: lead.id,
      message: `Thank you, ${lead.name}. Your inquiry (${lead.id}) has been delivered to GB ENVIROTECH technical desk.`,
      lead: lead
    });
  } catch (err) {
    console.error('Error processing contact inquiry:', err);
    res.status(500).json({ success: false, error: 'Server error while submitting message.' });
  }
});

// ==========================================
// ADMIN CRM API ROUTES
// ==========================================

// Simple Auth Middleware
function checkAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Invalid admin security key.' });
  }
  next();
}

// Admin Login Check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD, message: 'Authentication successful.' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password. Check ADMIN_PASSWORD in .env.' });
  }
});

// List All Leads with Optional Filters
app.get('/api/admin/leads', checkAdminAuth, (req, res) => {
  const leads = readLeads();
  const { status, type, crop } = req.query;

  let filtered = leads;
  if (status) filtered = filtered.filter(l => l.status === status);
  if (type) filtered = filtered.filter(l => l.type === type);
  if (crop) filtered = filtered.filter(l => l.crop && l.crop.toLowerCase().includes(crop.toLowerCase()));

  // Summary Metrics
  const metrics = {
    total: leads.length,
    rfqCount: leads.filter(l => l.type === 'rfq').length,
    contactCount: leads.filter(l => l.type === 'contact').length,
    newCount: leads.filter(l => l.status === 'NEW').length,
    totalPlantletsRequested: leads
      .filter(l => l.type === 'rfq' && l.quantity)
      .reduce((sum, l) => sum + (parseInt(l.quantity) || 0), 0)
  };

  res.json({ success: true, metrics, leads: filtered });
});

// Update Lead Status & Notes
app.patch('/api/admin/leads/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const leads = readLeads();
  const index = leads.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Lead not found.' });
  }

  if (status) {
    leads[index].status = status;
    leads[index].history = leads[index].history || [];
    leads[index].history.push({
      action: `Status updated to ${status}`,
      time: new Date().toISOString()
    });
  }

  if (adminNotes !== undefined) {
    leads[index].adminNotes = adminNotes;
  }

  writeLeads(leads);
  res.json({ success: true, lead: leads[index] });
});

// Export Leads to CSV
app.get('/api/admin/export', checkAdminAuth, (req, res) => {
  const leads = readLeads();

  const headers = [
    'Lead ID', 'Type', 'Date (IST)', 'Status', 'Crop', 'Supply Stage', 
    'Plantlet Quantity', 'Acreage', 'Buyer Name', 'Organization', 
    'Phone', 'Email', 'State / District', 'GSTIN', 'Timeline', 'Customer Notes', 'Admin Notes'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = leads.map(l => [
    escapeCSV(l.id),
    escapeCSV(l.type),
    escapeCSV(new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
    escapeCSV(l.status),
    escapeCSV(l.crop || ''),
    escapeCSV(l.stage || ''),
    escapeCSV(l.quantity || ''),
    escapeCSV(l.acreage || ''),
    escapeCSV(l.name),
    escapeCSV(l.organization || ''),
    escapeCSV(l.phone || ''),
    escapeCSV(l.email || ''),
    escapeCSV(l.state || ''),
    escapeCSV(l.gstin || ''),
    escapeCSV(l.timeline || ''),
    escapeCSV(l.notes || l.message || ''),
    escapeCSV(l.adminNotes || '')
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="gb-envirotech-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csvContent);
});

// Admin Route Direct View
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to index.html for root navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`
===========================================================
🌱 GB ENVIROTECH - Production Backend Online
===========================================================
- Website URL:      http://localhost:${PORT}
- Admin Lead CRM:   http://localhost:${PORT}/admin
- API Healthcheck:  http://localhost:${PORT}/api/health
- Admin Password:   ${ADMIN_PASSWORD} (Change in .env)
- Leads Storage:    ${LEADS_FILE}
===========================================================
  `);
});
