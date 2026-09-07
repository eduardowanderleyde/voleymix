import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme';
import FormScreen from '../components/FormScreen';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    setErro('');
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

  return (
    <FormScreen contentStyle={styles.center}>
      <View style={styles.card}>
        <Text style={styles.title}>🏐 Entrar</Text>

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
          placeholder="Senha"
          placeholderTextColor={colors.inkSoft}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleEntrar} disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Ainda não tem conta? Criar conta</Text>
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
