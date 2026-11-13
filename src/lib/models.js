import mongoose from "mongoose";

// All Mongo models in one place.
// Same shape for My List and Continue Watching. `key` is the TMDB id ("550") or "ia:<archive id>".
const ListItem = new mongoose.Schema(
  {
    key: { type: String, required: true },
    href: String,
    title: String,
    poster: String,
    backdrop: String,
    year: String,
    genreIds: [Number],
    releaseDate: String,
    remind: { type: Boolean, default: false },
    position: Number,
    duration: Number,
    addedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    usernameLower: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash (field name kept for existing users)
    phone: { type: String, trim: true },
    country: { type: String, uppercase: true, trim: true },
    age: { type: Number, min: 1, max: 120 },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    lastLoginAt: Date,
    watchlist: { type: [ListItem], default: [] },
    history: { type: [ListItem], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.models.Users || mongoose.model("Users", UserSchema);

const ReviewSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, index: true },
    movieTitle: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    username: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500, default: "" },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);
ReviewSchema.index({ tmdbId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

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

export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

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

export const MovieOverride = mongoose.models.MovieOverride || mongoose.model("MovieOverride", OverrideSchema);

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  signupsOpen: { type: Boolean, default: true },
  maintenance: { type: Boolean, default: false },
  downloadsEnabled: { type: Boolean, default: true },
  freeLibraryEnabled: { type: Boolean, default: true },
  announcement: { type: String, default: "", maxlength: 240 },
});

export const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

// Lightweight analytics. Auto-deleted after 180 days (TTL).
const EventSchema = new mongoose.Schema({
  type: { type: String, enum: ["play", "download"], required: true },
  key: String,
  title: String,
  userId: mongoose.Schema.Types.ObjectId,
  country: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

