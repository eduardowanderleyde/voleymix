import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  projectId: 'voley-mix',
  appId: '1:1041899685630:web:e0152fd8520433989e47af',
  storageBucket: 'voley-mix.firebasestorage.app',
  apiKey: 'AIzaSyD9s8whhO7t83rhs915EdAu8fod6M6AVJo',
  authDomain: 'voley-mix.firebaseapp.com',
  messagingSenderId: '1041899685630',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence:
    Platform.OS === 'web'
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
