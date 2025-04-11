const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    reciepent: [
        {
            type: String,
            required: true,
            index: true
        }
    ],
    sender: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
           "newVideo",
           "liveStream",
           "notification"
        ]
    },
    content: {
        type: String,
        required: true
    },
    realTime: {
        type: Boolean,
        default: false
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },

  }, {timestamps: true});

  const Notification= mongoose.model("Notification", NotificationSchema);
  module.exports= Notification;