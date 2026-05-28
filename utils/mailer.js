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

async function sendCareerEmails({ application, cvBuffer, cvFile, coverBuffer, coverFile }) {
  const adminEmail = process.env.CAREER_ADMIN_EMAIL || "career@asian-loop.com";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const typeLabel =
    application.applicationType === "internship"
      ? "Internship Application"
      : "Career Application";

  await transporter.sendMail({
    from: `"Asianloop Career" <${fromEmail}>`,
    to: adminEmail,
    subject: `New ${typeLabel} - ${application.fullName}`,
    html: `
      <h2>New ${typeLabel}</h2>
      <p>A new application has been submitted through the Asianloop website.</p>

      <h3>Applicant Details</h3>
      <p><strong>Name:</strong> ${application.title} ${application.fullName}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>Nationality:</strong> ${application.nationality}</p>
      <p><strong>Current Location:</strong> ${application.currentLocation}</p>

      <h3>Application Details</h3>
      <p><strong>Application Type:</strong> ${typeLabel}</p>
      <p><strong>Background:</strong> ${application.background}</p>
      <p><strong>Interested Department:</strong> ${application.interestedDepartment}</p>
      <p><strong>Qualification:</strong> ${application.qualification}</p>
      <p><strong>Years of Experience:</strong> ${application.yearsExperience}</p>
      <p><strong>Current Salary:</strong> ${application.currentSalary || "-"}</p>
      <p><strong>Expected Salary:</strong> ${application.expectedSalary || "-"}</p>
      <p><strong>Notice Period:</strong> ${application.noticePeriod || "-"}</p>
      <p><strong>LinkedIn:</strong> ${application.linkedinUrl || "-"}</p>

      <h3>Message</h3>
      <p>${application.message || "-"}</p>
    `,
    attachments: [
      {
        filename: cvFile.originalname,
        content: cvBuffer,
        contentType: cvFile.mimetype
      },
      {
        filename: coverFile.originalname,
        content: coverBuffer,
        contentType: coverFile.mimetype
      }
    ]
  });

  await transporter.sendMail({
    from: `"Asianloop Career" <${fromEmail}>`,
    to: application.email,
    cc: adminEmail,
    subject: `Application Received - Asianloop ${typeLabel}`,
    html: `
      <p>Dear ${application.title} ${application.fullName},</p>

      <p>Thank you for submitting your application to Asianloop.</p>

      <p>We have received your details and supporting documents for the selected ${application.applicationType === "internship" ? "internship opportunity" : "career opportunity"}.</p>

      <p>Our team will review your submission and contact you if your profile matches our current or upcoming requirements.</p>

      <p>We appreciate your interest in becoming part of Asianloop’s journey in building advanced industrial, calibration, and technology capabilities in Malaysia and the region.</p>

      <p>Regards,<br>
      Career Team<br>
      Asianloop Sdn Bhd<br>
      career@asian-loop.com</p>
    `
  });
}

module.exports = { sendCareerEmails };
