import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function getPersistentItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setPersistentItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
