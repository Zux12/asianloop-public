const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const CareerApplication = require("../models/CareerApplication");
const { sendCareerEmails } = require("../utils/mailer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
    }

    cb(null, true);
  }
});

function getBucket() {
  const db = mongoose.connection.db;

  return new GridFSBucket(db, {
    bucketName: "career_uploads"
  });
}

function uploadToGridFS(file) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: {
        uploadedAt: new Date()
      }
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size
      });
    });

    uploadStream.on("error", reject);
  });
}

router.post(
  "/apply",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          ok: false,
          message: "Database is not connected. Please try again later."
        });
      }

      const body = req.body;
      const cleanEmail = String(body.email || "").trim().toLowerCase();
      const cleanDepartment = String(body.interestedDepartment || "").trim();

      if (!cleanEmail) {
        return res.status(400).json({
          ok: false,
          message: "Email is required."
        });
      }

      if (!cleanDepartment) {
        return res.status(400).json({
          ok: false,
          message: "Interested department is required."
        });
      }

      const existingApplication = await CareerApplication.findOne({
        email: cleanEmail,
        interestedDepartment: cleanDepartment
      });

      if (existingApplication) {
        return res.status(409).json({
          ok: false,
          message:
            "You have already submitted an application for this interested department. You may submit another application only for a different department."
        });
      }

      if (!req.files?.cv?.[0]) {
        return res.status(400).json({
          ok: false,
          message: "CV upload is required."
        });
      }

      if (!req.files?.coverLetter?.[0]) {
        return res.status(400).json({
          ok: false,
          message: "Cover letter upload is required."
        });
      }

      const cvOriginal = req.files.cv[0];
      const coverOriginal = req.files.coverLetter[0];

      const cvBuffer = Buffer.from(cvOriginal.buffer);
      const coverBuffer = Buffer.from(coverOriginal.buffer);

      const cvFile = await uploadToGridFS(cvOriginal);
      const coverLetterFile = await uploadToGridFS(coverOriginal);

      const application = await CareerApplication.create({
        applicationType: body.applicationType,
        title: body.title,
        fullName: body.fullName,
        email: cleanEmail,
        phone: body.phone,
        nationality: body.nationality,
        currentLocation: body.currentLocation,
        background: body.background,
        interestedDepartment: cleanDepartment,
        qualification: body.qualification,
        yearsExperience: Number(body.yearsExperience || 0),
        currentSalary: body.currentSalary || "",
        expectedSalary: body.expectedSalary || "",
        noticePeriod: body.noticePeriod || "",
        linkedinUrl: body.linkedinUrl || "",
        message: body.message || "",
        consent: body.consent === "true" || body.consent === "on",
        cvFile,
        coverLetterFile
      });

      await sendCareerEmails({
        application,
        cvBuffer,
        cvFile: cvOriginal,
        coverBuffer,
        coverFile: coverOriginal
      });

      return res.status(201).json({
        ok: true,
        message: "Application submitted successfully.",
        applicationId: application._id
      });
    } catch (err) {
      console.error("Career application error:", err);

      return res.status(500).json({
        ok: false,
        message: err.message || "Application submission failed."
      });
    }
  }
);

module.exports = router;
