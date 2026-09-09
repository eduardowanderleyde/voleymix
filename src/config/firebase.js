import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Client ID do tipo "Web application" gerado pelo Firebase ao habilitar o
// provedor Google em Authentication > Sign-in method (Google Cloud Console
// > APIs & Services > Credentials, ou dentro do google-services.json em
// client[].oauth_client[] com client_type 3).
export const GOOGLE_WEB_CLIENT_ID =
  '1041899685630-4qg4i8ok89qhs218guk2va6eq1iascmi.apps.googleusercontent.com';

const firebaseConfig = {
  projectId: 'voley-mix',
  appId: '1:1041899685630:web:e0152fd8520433989e47af',
  storageBucket: 'voley-mix.firebasestorage.app',
  apiKey: 'AIzaSyD9s8whhO7t83rhs915EdAu8fod6M6AVJo',
  authDomain: 'voley-mix.firebaseapp.com',
  messagingSenderId: '1041899685630',
};

const app = initializeApp(firebaseConfig);

// getAuth() no web configura automaticamente o resolvedor de popup/redirect
// (necessário pro signInWithPopup do Google funcionar); initializeAuth não faz
// isso, então usamos ele só no nativo, com a persistência via AsyncStorage.
export const auth =
  Platform.OS === 'web' ? getAuth(app) : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

// Usado pelos testes e2e (ver e2e/app.spec.js) pra rodar contra os
// emuladores locais em vez do projeto de produção: EXPO_PUBLIC_USE_EMULATOR=1
if (process.env.EXPO_PUBLIC_USE_EMULATOR === '1') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
