import mongoose from "mongoose";

const chunkProcessingSchema= new mongoose.Schema({
    videoID: {
        type: String,
        required: true
    },
    resolution: {
        type: String,
        required: true
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    chunkS3Url: {
        type: String,
        required: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    },
    processed: {
        type: Boolean,
        default: false
    },
},{
    timeseries: true
});
chunkProcessingSchema.index({ videoId: 1, resolution: 1, chunkIndex: 1 }, { unique: true });

const ChunkProcessing= mongoose.model("ChunkProcessing", chunkProcessingSchema);

export default ChunkProcessing;