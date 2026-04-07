const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Send a push notification to a specific user
 * @param {string} pushToken - The target Expo Push Token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  // Create the messages that you want to send to clients
  const messages = [{
    to: pushToken,
    sound: "default",
    title: title,
    body: body,
    data: data,
  }];

  // The Expo push notification service accepts batches of tickets. Each ticket
  // corresponds to a single message.
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error, you should handle it here
      // e.g. 'DeviceNotRegistered' means the token is invalid and should be removed from your DB
    } catch (error) {
      console.error(error);
    }
  }

  // After sending, you can check the receipts for further status
  // (Optional: Implement receipt checking if high reliability is needed)
}

module.exports = {
  sendPushNotification,
};
