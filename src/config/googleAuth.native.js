import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, GOOGLE_WEB_CLIENT_ID } from './firebase';

let configurado = false;

export async function signInWithGoogle() {
  if (!configurado) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    configurado = true;
  }

  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.data?.idToken ?? userInfo.idToken;
  if (!idToken) {
    throw new Error('Não foi possível obter o token do Google.');
  }
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}
