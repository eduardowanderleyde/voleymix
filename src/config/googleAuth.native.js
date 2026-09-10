import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, GOOGLE_WEB_CLIENT_ID } from './firebase';

let googleSigninModulo = null;

// @react-native-google-signin/google-signin usa TurboModuleRegistry.getEnforcing,
// que LANÇA no exato momento em que o módulo é importado se o app não tiver
// esse código nativo compilado — é o caso do Expo Go. Se isso fosse um
// `import` normal no topo do arquivo, o app inteiro quebraria na tela de
// Login assim que abrisse no Expo Go, antes mesmo do usuário tentar entrar
// com o Google. Com `require()` dentro de uma função (só executado quando
// alguém aperta o botão) + try/catch, o resto do app continua funcionando
// normalmente — só o login com Google fica indisponível até rodar num build
// de desenvolvimento de verdade (expo prebuild + run:android/run:ios).
function carregarGoogleSignin() {
  if (!googleSigninModulo) {
    googleSigninModulo = require('@react-native-google-signin/google-signin');
  }
  return googleSigninModulo;
}

let configurado = false;

export async function signInWithGoogle() {
  let GoogleSignin;
  try {
    GoogleSignin = carregarGoogleSignin().GoogleSignin;
  } catch (e) {
    throw new Error(
      'Login com Google no celular só funciona num build de desenvolvimento — não dá no Expo Go.'
    );
  }

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
