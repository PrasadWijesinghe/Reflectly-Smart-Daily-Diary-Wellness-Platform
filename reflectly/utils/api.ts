import Constants from "expo-constants";

export const getApiUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:5000/api`;
  }
  return "http://localhost:5000/api";
};
