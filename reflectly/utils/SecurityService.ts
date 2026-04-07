import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PIN_KEY = "user_security_pin";
const LOCK_ENABLED_KEY = "biometric_lock_enabled";

class SecurityService {
  /**
   * Check if biometrics (FaceID/Fingerprint) are available and enrolled
   */
  async getBiometricStatus() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      isAvailable: hasHardware && isEnrolled,
    };
  }

  /**
   * Trigger the biometric authentication prompt
   */
  async authenticate() {
    const status = await this.getBiometricStatus();
    if (!status.isAvailable) return { success: false, error: "Not available" };

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Reflectly",
      fallbackLabel: "Use PIN",
      cancelLabel: "Cancel",
      disableDeviceFallback: true, // We use our own custom PIN pad fallback
    });

    return result;
  }

  /**
   * Securely save the 4-digit PIN
   */
  async savePIN(pin: string) {
    if (pin.length !== 4) throw new Error("PIN must be 4 digits");
    await SecureStore.setItemAsync(PIN_KEY, pin);
  }

  /**
   * Verify the entered PIN against the saved PIN
   */
  async verifyPIN(inputPin: string) {
    const savedPin = await SecureStore.getItemAsync(PIN_KEY);
    return savedPin === inputPin;
  }

  /**
   * Check if a PIN has been set up
   */
  async hasPIN() {
    const savedPin = await SecureStore.getItemAsync(PIN_KEY);
    return !!savedPin;
  }

  /**
   * Enable or disable the app lock
   */
  async setLockEnabled(enabled: boolean) {
    await AsyncStorage.setItem(LOCK_ENABLED_KEY, JSON.stringify(enabled));
  }

  /**
   * Check if the app lock is enabled by the user
   */
  async isLockEnabled() {
    const enabled = await AsyncStorage.getItem(LOCK_ENABLED_KEY);
    return enabled ? JSON.parse(enabled) : false;
  }
}

export default new SecurityService();
