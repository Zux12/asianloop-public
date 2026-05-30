const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post("/register", async (req, res) => {
  try {

    const data = req.body;

    const fromEmail =
      process.env.SMTP_FROM ||
      process.env.SMTP_USER;

    const adminEmails = [
      "info@asian-loop.com",
      "dylarazak@oilandgasmeta.com"
    ];

    let participantHtml = "";

    data.participants.forEach((p, idx) => {
      participantHtml += `
        <h4>Participant ${idx + 1}</h4>
        <ul>
          <li><strong>Name:</strong> ${p.fullName}</li>
          <li><strong>NRIC / Passport:</strong> ${p.idNumber}</li>
          <li><strong>Designation:</strong> ${p.designation}</li>
          <li><strong>Department:</strong> ${p.department}</li>
          <li><strong>Email:</strong> ${p.email}</li>
          <li><strong>Mobile:</strong> ${p.mobile}</li>
          <li><strong>Vegetarian:</strong> ${p.vegetarian}</li>
        </ul>
      `;
    });

    await transporter.sendMail({
      from: `"MALTECH Registration" <${fromEmail}>`,
      to: adminEmails.join(","),
      subject: `New MALTECH Registration - ${data.company.companyName}`,
      html: `
        <h2>New MALTECH Registration</h2>

        <h3>Company Details</h3>

        <p><strong>Company:</strong> ${data.company.companyName}</p>
        <p><strong>Address:</strong> ${data.company.companyAddress}</p>

        <p><strong>PIC Name:</strong> ${data.company.picName}</p>
        <p><strong>PIC Designation:</strong> ${data.company.picDesignation}</p>

        <p><strong>PIC Email:</strong> ${data.company.picEmail}</p>
        <p><strong>PIC Phone:</strong> ${data.company.picPhone}</p>

        <p><strong>HRD Claim:</strong> ${data.company.hrdClaim}</p>

        <hr>

        <h3>Participants</h3>

        ${participantHtml}
      `
    });

    await transporter.sendMail({
      from: `"MALTECH Registration" <${fromEmail}>`,
      to: data.company.picEmail,
      cc: adminEmails.join(","),
      subject: "Registration Received - MALTECH Flow Measurement & Metering Fundamentals",
      html: `
        <p>Dear ${data.company.picName},</p>

        <p>
          Thank you for registering for
          <strong>Flow Measurement & Metering Fundamentals</strong>
          under the
          <strong>Malaysian Technology Series (MALTECH)</strong>.
        </p>

        <p>
          We have successfully received your registration.
        </p>

        <p>
          Our team will review your submission and contact you shortly
          regarding confirmation, invoicing and HRD Corp documentation
          (if applicable).
        </p>

        <hr>

        <p>
          Event Date: 1–2 July 2026<br>
          Venue: Element Hotel Kuala Lumpur<br>
          Fee: RM1,750 per participant
        </p>

        <p>
          Regards,<br>
          MALTECH Secretariat<br>
          Asianloop × META
        </p>
      `
    });

    return res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

module.exports = router;
