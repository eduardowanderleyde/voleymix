import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { colors } from '../theme';
import FormScreen from '../components/FormScreen';

export default function SignupScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

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
    <FormScreen contentStyle={styles.center}>
      <View style={styles.card}>
        <Text style={styles.title}>🏐 Criar conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.inkSoft}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.inkSoft}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={colors.inkSoft}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor={colors.inkSoft}
          secureTextEntry
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

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 24 },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4DFCF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.ink,
  },
  erro: { color: colors.coral, marginBottom: 12, textAlign: 'center' },
  button: {
    width: '100%',
    backgroundColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  link: { color: colors.ocean, fontWeight: '600' },
});
