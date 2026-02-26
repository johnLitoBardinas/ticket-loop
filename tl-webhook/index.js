const express = require("express");
const fs = require("fs");
const path = require("path");
const { BrevoClient } = require("@getbrevo/brevo");
require("dotenv").config();

const LOGS_DIR = path.join(__dirname, "logs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 9999;

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/webhook/ticket-created", async (req, res) => {
  const { id, contact, issue_description, status, created_at } = req.body;

  if (!id || !contact || !issue_description) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: id, contact, issue_description",
    });
  }

  // Log ticket data to daily file
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    const now = new Date();
    const dateStr = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${now.getFullYear()}`;
    const filename = `ticket-${dateStr}.txt`;
    const filepath = path.join(LOGS_DIR, filename);
    const timestamp = now.toISOString();
    const line = `${JSON.stringify(req.body)} - ${timestamp}\n`;
    fs.appendFileSync(filepath, line);
  } catch (logErr) {
    console.error("File log error:", logErr.message);
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `New Ticket #${id} — ${issue_description.substring(0, 50)}`,
      htmlContent: `
        <h2>New Support Ticket Created</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; font-weight: bold;">Ticket ID</td><td style="padding: 8px;">#${id}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${contact.full_name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${contact.email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Issue</td><td style="padding: 8px;">${issue_description}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Status</td><td style="padding: 8px;">${status}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Created</td><td style="padding: 8px;">${created_at}</td></tr>
        </table>
      `,
      sender: {
        name: "Ticket Loop",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: process.env.ADMIN_EMAIL }],
    });

    res.status(200).json({
      success: true,
      ticket_id: id,
      email_sent: true,
    });
  } catch (err) {
    console.error("Brevo email error:", err.message);
    res.status(500).json({
      success: false,
      ticket_id: id,
      email_sent: false,
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`tl-webhook listening on port ${PORT}`);
});
