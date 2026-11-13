import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // tmdb id or "ia:<id>"
    href: String,
    title: String,
    type: { type: String, enum: ["broken", "inappropriate", "wrong_age", "copyright", "other"], default: "other" },
    message: { type: String, maxlength: 500, default: "" },
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
