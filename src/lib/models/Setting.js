import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  signupsOpen: { type: Boolean, default: true },
  maintenance: { type: Boolean, default: false },
  downloadsEnabled: { type: Boolean, default: true },
  freeLibraryEnabled: { type: Boolean, default: true },
  announcement: { type: String, default: "", maxlength: 240 },
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
