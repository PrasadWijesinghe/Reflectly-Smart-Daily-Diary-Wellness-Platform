import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // ==========================================
  // 1. Morning Motivation Quotes (උදේ 8.00 ට)
  // ==========================================
  async scheduleMorningMotivation() {
    // ලස්සන Quotes ටිකක්
    const quotes = [
      "Today is a fresh start! Make it count. 🌅",
      "Take a deep breath. You've got this! 💪",
      "Small steps every day lead to big changes. ✨",
      "Be kind to your mind today. 🧠",
      "Your wellness matters. Take time for yourself today. 🧘‍♀️"
    ];
    // Random එකක් තෝරගන්නවා
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Morning! ☀️",
        body: randomQuote,
        data: { screen: "home" },
        sound: true,
      },
      trigger: { hour: 8, minute: 0, repeats: true } as Notifications.NotificationTriggerInput,
    });
  }

  // ==========================================
  // 2. Inactivity Alert (දවස් 3ක් ඇප් එකට ආවේ නැත්නම්)
  // ==========================================
  async scheduleInactivityAlert() {
    // 1. කලින් දාපු Inactivity Alert එකක් තියෙනවා නම් ඒක අයින් කරනවා
    const oldId = await AsyncStorage.getItem("inactivity_notification_id");
    if (oldId) {
      await Notifications.cancelScheduledNotificationAsync(oldId);
    }

    // 2. අලුත් එකක් හරියටම දවස් 3කින් (තත්පර වලින්) Schedule කරනවා
    const newId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "We miss you! 👋",
        body: "It's been a few days since your last entry. Take a moment to reflect on your day.",
        data: { screen: "diary" },
        sound: true,
      },
      // දවස් 3 = පැය 72 = මිනිත්තු 4320 = තත්පර 259200
      trigger: { seconds: 3 * 24 * 60 * 60 } as Notifications.NotificationTriggerInput, 
    });

    // 3. අලුත් ID එක Save කරගන්නවා ඊළඟ පාර Cancel කරන්න
    await AsyncStorage.setItem("inactivity_notification_id", newId);
  }
}

export default new NotificationService();
