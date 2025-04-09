import mongoose from "mongoose";

const ResolutionSchema= new mongoose.Schema({
    filename: {type: String, required: true},
    s3Url: {type: String, required: true},
    size: {type: Number, required: true},
    format: {type: String, required: true},
    resolutions: {type: String, required: true}
});

const VideoSchema = new mongoose.Schema(
    {
      filename: { type: String, required: true },
      originalS3Url: { type: String, required: true },
      size: { type: Number, required: true },
      format: { type: String, required: true },
      resolutions: [ResolutionSchema], // Stores processed versions
      uploadedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
export const Video = mongoose.model("Video", VideoSchema);