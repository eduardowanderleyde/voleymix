import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { signInWithGoogle } from '../config/googleAuth';
import { garantirPerfilUsuario } from '../utils/perfil';
import { colors } from '../theme';
import AuthScreen from '../components/AuthScreen';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthField from '../components/AuthField';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AuthFooter from '../components/AuthFooter';
import { authStyles as styles } from './authSharedStyles';

export default function SignupScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  async function handleGoogle() {
    setErro('');
    setCarregandoGoogle(true);
    try {
      await signInWithGoogle();
      if (auth.currentUser) {
        await garantirPerfilUsuario(auth.currentUser);
      }
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== '12501') {
        setErro('Não foi possível continuar com o Google.');
      }
    } finally {
      setCarregandoGoogle(false);
    }
  }

  async function handleCriarConta() {
    setErro('');

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.');
      return;
    }

    setCarregando(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        nome: nome.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setErro('Esse email já tem conta cadastrada.');
      } else if (e.code === 'auth/invalid-email') {
        setErro('Email inválido.');
      } else {
        setErro('Não deu pra criar a conta. Tenta de novo.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthScreen>
      <View style={styles.card}>
        <AuthCardHeader subtitle="Crie sua conta para começar" />

        <AuthField label="Nome" icon="user" placeholder="Seu nome" value={nome} onChangeText={setNome} />
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
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChangeText={setSenha}
        />
        <AuthField
          label="Confirmar senha"
          icon="lock"
          secure
          placeholder="Repita a senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCriarConta} disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <GoogleSignInButton onPress={handleGoogle} loading={carregandoGoogle} />

        <AuthFooter prompt="Já tem conta?" actionLabel="Entrar" onPress={() => navigation.navigate('Login')} />
      </View>
    </AuthScreen>
  );
}
