const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    applicationType: {
      type: String,
      enum: ["career", "internship"],
      required: true
    },

    title: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    nationality: { type: String, required: true },
    currentLocation: { type: String, required: true },

    background: { type: String, required: true },
    interestedDepartment: { type: String, required: true },
    qualification: { type: String, required: true },

    yearsExperience: { type: Number, default: 0 },

    currentSalary: { type: String },
    expectedSalary: { type: String },
    noticePeriod: { type: String },
    linkedinUrl: { type: String },

    message: { type: String },

    cvFile: {
      fileId: mongoose.Schema.Types.ObjectId,
      filename: String,
      contentType: String,
      size: Number
    },

    coverLetterFile: {
      fileId: mongoose.Schema.Types.ObjectId,
      filename: String,
      contentType: String,
      size: Number
    },

status: {
  type: String,
  enum: ["submitted", "reviewing", "shortlisted", "rejected", "talent_pool"],
  default: "submitted"
},

reviewNotes: {
  type: String,
  default: ""
},

reviewedBy: {
  type: String,
  default: ""
},

reviewedAt: {
  type: Date
},

    consent: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
