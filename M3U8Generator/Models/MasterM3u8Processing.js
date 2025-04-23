import mongoose from "mongoose";

const masterM3U8ProcessingSchema= new mongoose.Schema({
    videoID: {
        type: String,
        required: true
    },
    masterM3U8S3Url: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'generated', 'failed'],
        default: 'pending'
    },
    resolutions: {
        type: [String],
        default: []
    }
})

masterM3U8ProcessingSchema.index({ videoID: 1,status: 1 }, { unique: true });


const MasterM3U8Processing= mongoose.model("MasterM3U8Processing", masterM3U8ProcessingSchema);

export default MasterM3U8Processing;