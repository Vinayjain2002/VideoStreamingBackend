import mongoose from "mongoose";

const videoProcessingSchema= new mongoose.Schema({
  videoID: {
    type: String,
    required: true,
    unique: true
  },
  resolutions: {
    type: [String],
    default: []
  },
  resolutionStatus: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  masterm3u8GenTriggered: {
    type: Boolean,
    default: false
  },
  masterM3u8GeneratedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
},{timestamps: true});

videoProcessingSchema.index({ videoID: 1, masterm3u8GenTriggered: 1 });
const VideoProcessing= mongoose.model('VideoProcessing', videoProcessingSchema);
export default VideoProcessing;