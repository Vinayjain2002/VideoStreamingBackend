import { io } from "../config/socketServer.js";
import admin from "firebase-admin";

// 🔥 Initialize Firebase for Push Notifications
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
});

/**
 * Check if a user is online.
 * @param {string} userId
 * @returns {boolean}
 */
export const isUserOnline = async (userId) => {
  return io.sockets.adapter.rooms.has(userId); // Checks if user is connected
};

/**
 * Send WebSocket notification.
 * @param {string} userId
 * @param {string} message
 */
export const sendSocketNotification = async (userId, message) => {
  io.to(userId).emit("notification", { message });
};

/**
 * Send Push Notification (Firebase).
 * @param {string} userId
 * @param {string} message
 */
export const sendPushNotification = async (userId, message) => {
  const payload = {
    notification: { title: "New Notification", body: message },
    token: await getUserDeviceToken(userId), // Get Firebase Token
  };

  await admin.messaging().send(payload);
};

/**
 * Fetch user's Firebase device token.
 * @param {string} userId
 * @returns {Promise<string>}
 */
const getUserDeviceToken = async (userId) => {
  // Fetch from DB or cache
  return "user-firebase-token";
};
