import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signInWithGoogle } from '../config/googleAuth';
import { garantirPerfilUsuario } from '../utils/perfil';
import { colors } from '../theme';
import AuthScreen from '../components/AuthScreen';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthField from '../components/AuthField';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AuthFooter from '../components/AuthFooter';
import { authStyles as styles } from './authSharedStyles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  async function handleEntrar() {
    setErro('');
    setMensagem('');
    if (!email || !senha) {
      setErro('Preencha email e senha.');
      return;
    }
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (e) {
      setErro('Email ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleGoogle() {
    setErro('');
    setMensagem('');
    setCarregandoGoogle(true);
    try {
      await signInWithGoogle();
      if (auth.currentUser) {
        await garantirPerfilUsuario(auth.currentUser);
      }
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== '12501') {
        setErro('Não foi possível entrar com o Google.');
      }
    } finally {
      setCarregandoGoogle(false);
    }
  }

  async function handleEsqueciSenha() {
    setErro('');
    setMensagem('');
    if (!email) {
      setErro('Digite seu email para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMensagem('Enviamos um link de recuperação para seu email.');
    } catch (e) {
      setErro('Não foi possível enviar o email de recuperação.');
    }
  }

  return (
    <AuthScreen>
      <View style={styles.card}>
        <AuthCardHeader subtitle="Entre para acessar sua conta" />

        <AuthField
          label="E-mail"
          icon="mail"
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthField
          label="Senha"
          icon="lock"
          secure
          placeholder="Sua senha"
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity onPress={handleEsqueciSenha} style={loginStyles.forgotWrap} hitSlop={8}>
          <Text style={loginStyles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        {mensagem ? <Text style={styles.sucesso}>{mensagem}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleEntrar} disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <GoogleSignInButton onPress={handleGoogle} loading={carregandoGoogle} />

        <AuthFooter
          prompt="Ainda não tem conta?"
          actionLabel="Criar conta"
          onPress={() => navigation.navigate('Signup')}
        />
      </View>
    </AuthScreen>
  );
}

const loginStyles = StyleSheet.create({
  forgotWrap: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 },
  forgotText: { color: colors.ocean, fontSize: 13, fontWeight: '600' },
});
