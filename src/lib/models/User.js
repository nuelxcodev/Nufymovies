import mongoose from "mongoose";

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

export default mongoose.models.Users || mongoose.model("Users", UserSchema);
