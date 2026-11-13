import mongoose from "mongoose";

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

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
