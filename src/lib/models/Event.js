import mongoose from "mongoose";

// Lightweight analytics. Auto-deleted after 180 days (TTL).
const EventSchema = new mongoose.Schema({
  type: { type: String, enum: ["play", "download"], required: true },
  key: String,
  title: String,
  userId: mongoose.Schema.Types.ObjectId,
  country: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
