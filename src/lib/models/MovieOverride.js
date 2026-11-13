import mongoose from "mongoose";

// Admin controls per movie. One document per TMDB id.
const OverrideSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true },
    title: String,
    poster: String,
    hidden: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    minAge: { type: Number, min: 0, max: 21, default: 0 },
    archiveId: { type: String, default: "" }, // force a specific Internet Archive item
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.MovieOverride || mongoose.model("MovieOverride", OverrideSchema);
