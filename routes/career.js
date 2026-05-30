const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const CareerApplication = require("../models/CareerApplication");
const { sendCareerEmails } = require("../utils/mailer");

const router = express.Router();

function requireCareerAdmin(req, res, next) {
  const auth = req.headers.authorization || "";

  if (!auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic realm='Career Admin'");
    return res.status(401).send("Authentication required");
  }

  const decoded = Buffer.from(auth.split(" ")[1], "base64").toString("utf8");
  const [user, pass] = decoded.split(":");

  if (
    user === process.env.CAREER_ADMIN_USER &&
    pass === process.env.CAREER_ADMIN_PASSWORD
  ) {
    return next();
  }

  res.setHeader("WWW-Authenticate", "Basic realm='Career Admin'");
  return res.status(401).send("Invalid username or password");
}

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


router.get("/admin/applications", requireCareerAdmin, async (req, res) => {
  try {
    const { type, department, background, qualification, status, q } = req.query;

    const filter = {};

    if (type) filter.applicationType = type;
    if (department) filter.interestedDepartment = department;
    if (background) filter.background = background;
    if (qualification) filter.qualification = qualification;
    if (status) filter.status = status;

    if (q) {
      filter.$or = [
        { fullName: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") }
      ];
    }

    const items = await CareerApplication.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ok: true, items });
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ ok: false, message: "Unable to load applications." });
  }
});

router.get("/admin/application/:id", requireCareerAdmin, async (req, res) => {
  try {
    const item = await CareerApplication.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({ ok: false, message: "Application not found." });
    }

    res.json({ ok: true, item });
  } catch (err) {
    console.error("Admin detail error:", err);
    res.status(500).json({ ok: false, message: "Unable to load application." });
  }
});

router.get("/admin/download/:fileId", requireCareerAdmin, async (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    const files = await mongoose.connection.db
      .collection("career_uploads.files")
      .find({ _id: fileId })
      .toArray();

    if (!files.length) {
      return res.status(404).send("File not found.");
    }

    const file = files[0];

    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("Admin download error:", err);
    res.status(500).send("Unable to download file.");
  }
});

router.patch("/admin/status/:id", requireCareerAdmin, async (req, res) => {
  try {
    const { status, reviewNotes, reviewedBy } = req.body;

    const allowedStatus = [
      "submitted",
      "reviewing",
      "shortlisted",
      "rejected",
      "talent_pool"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ ok: false, message: "Invalid status." });
    }

    const updated = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes: reviewNotes || "",
        reviewedBy: reviewedBy || "",
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ ok: false, message: "Application not found." });
    }

    res.json({ ok: true, item: updated });
  } catch (err) {
    console.error("Admin status error:", err);
    res.status(500).json({ ok: false, message: "Unable to update status." });
  }
});



router.delete("/admin/application/:id", requireCareerAdmin, async (req, res) => {
  try {
    const application = await CareerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        ok: false,
        message: "Application not found."
      });
    }

    const bucket = getBucket();

    const fileIds = [
      application.cvFile?.fileId,
      application.coverLetterFile?.fileId
    ].filter(Boolean);

    for (const fileId of fileIds) {
      try {
        await bucket.delete(new mongoose.Types.ObjectId(fileId));
      } catch (fileErr) {
        console.warn("GridFS file delete warning:", fileErr.message);
      }
    }

    await CareerApplication.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      message: "Application and uploaded files deleted successfully."
    });
  } catch (err) {
    console.error("Admin delete error:", err);
    res.status(500).json({
      ok: false,
      message: "Unable to delete application."
    });
  }
});


module.exports = router;
