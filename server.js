require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const careerRoutes = require("./routes/career");
const maltechRoutes = require("./routes/maltech");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/career", careerRoutes);
app.use("/api/maltech", maltechRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      dbName: "asianloop_career"
    })
    .then(() => {
      console.log("MongoDB connected: asianloop_career");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
} else {
  console.warn("MONGODB_URI not set. Career form database features will not work.");
}



// Serve static files from /public
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Friendly routes: /about -> /about.html
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  const file = path.join(__dirname, "public", `${page}.html`);
  res.sendFile(file, (err) => (err ? next() : null));
});






const { sendCareerEmails } = require("./utils/mailer");

app.get("/test-email", async (req, res) => {
  try {
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

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "career@asian-loop.com",
      subject: "SMTP Test",
      html: "<h2>SMTP Test Successful</h2>"
    });

    res.json({
      ok: true,
      messageId: info.messageId
    });
  } catch (err) {
    console.error("SMTP TEST ERROR:", err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});











// Fallback to home
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Asianloop public site running on :${PORT}`));
