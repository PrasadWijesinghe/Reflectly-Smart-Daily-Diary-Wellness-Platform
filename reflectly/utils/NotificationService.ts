import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  /**
   * Request permissions and get the Expo Push Token
   */
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // Extract projectId from expo-constants
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;

      console.log("Expo Push Token:", token);
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  /**
   * Schedule a local notification for daily reminders at 8:00 PM
   */
  async scheduleDailyReminder() {
    // First, cancel any existing daily reminders to avoid duplicates
    await this.cancelDailyReminders();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for Reflection! 📝",
        body: "How was your day? Take a moment to write in your diary.",
        data: { screen: "diary" },
        sound: true,
      },
      trigger: {
        hour: 20, // 8:00 PM
        minute: 0,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
    });

    console.log("Daily reminder scheduled with ID:", identifier);
    return identifier;
  }

  /**
   * Cancel all scheduled daily reminders
   */
  async cancelDailyReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All scheduled notifications cancelled.");
  }

  /**
   * Check if notifications are enabled
   */
  async getNotificationStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }
}

export default new NotificationService();
