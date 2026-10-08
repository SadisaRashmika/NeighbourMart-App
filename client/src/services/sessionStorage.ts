import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'neighbourmart.session-token';

export async function loadSessionToken() {
  if (Platform.OS === 'web') return globalThis.sessionStorage?.getItem(SESSION_KEY) ?? globalThis.localStorage?.getItem(SESSION_KEY) ?? null;
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function saveSessionToken(token: string, remember: boolean) {
  if (Platform.OS === 'web') {
    globalThis.sessionStorage?.removeItem(SESSION_KEY);
    globalThis.localStorage?.removeItem(SESSION_KEY);
    (remember ? globalThis.localStorage : globalThis.sessionStorage)?.setItem(SESSION_KEY, token);
    return;
  }
  if (remember) await SecureStore.setItemAsync(SESSION_KEY, token);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function clearSessionToken() {
  if (Platform.OS === 'web') {
    globalThis.sessionStorage?.removeItem(SESSION_KEY);
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
