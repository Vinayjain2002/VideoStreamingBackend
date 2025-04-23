import mongoose  from "mongoose";

const resolutionProcessingSchema= new mongoose.Schema({
    videoID:{
        type: String,
        required: true
    },
    resolution: {
        type: String,
        requried: true
    },
    expectedChunks: {
        type: Number,
        required: true
    },
    uploadedChunks: {
        type: Number,
        default: 0
    },
    m3u8Generated: {
        type: Boolean,
        default: false
    },
    m3u8S3Url: {
        type: String,
        default: null
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
},{timestamps: true});

resolutionProcessingSchema.index({videoID: 1, resolution: 1}, {unique: true});

const ResolutionProcessing = mongoose.model("ResolutionProcessing", resolutionProcessingSchema);

export default ResolutionProcessing;