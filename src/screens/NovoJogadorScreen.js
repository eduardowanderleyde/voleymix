import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { colors, NIVEIS, POSICOES } from '../theme';
import FormScreen from '../components/FormScreen';

export default function NovoJogadorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const jogadorExistente = route.params?.jogador;

  const [nome, setNome] = useState(jogadorExistente?.nome ?? '');
  const [nivel, setNivel] = useState(jogadorExistente?.nivel ?? 3);
  const [posicao, setPosicao] = useState(jogadorExistente?.posicao ?? 'qualquer');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    setErro('');
    if (!nome.trim()) {
      setErro('Digite o nome do jogador.');
      return;
    }

    setSalvando(true);
    try {
      if (jogadorExistente) {
        await updateDoc(doc(db, 'jogadores', jogadorExistente.id), {
          nome: nome.trim(),
          nivel,
          posicao,
        });
      } else {
        await addDoc(collection(db, 'jogadores'), {
          ownerId: auth.currentUser.uid,
          nome: nome.trim(),
          nivel,
          posicao,
          createdAt: serverTimestamp(),
        });
      }
      navigation.goBack();
    } catch (e) {
      setErro('Não deu pra salvar. Tenta de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormScreen>
      <Text style={styles.title}>{jogadorExistente ? '✏️ Editar jogador' : '🏐 Novo jogador'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor={colors.inkSoft}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Nível ({nivel})</Text>
      <View style={styles.row}>
        {NIVEIS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.chip, nivel === n && styles.chipAtivo]}
            onPress={() => setNivel(n)}
          >
            <Text style={[styles.chipText, nivel === n && styles.chipTextAtivo]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Posição</Text>
      <View style={styles.rowWrap}>
        {POSICOES.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.chip, posicao === p.value && styles.chipAtivo]}
            onPress={() => setPosicao(p.value)}
          >
            <Text style={[styles.chipText, posicao === p.value && styles.chipTextAtivo]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={salvando}>
        {salvando ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 4 },
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
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipAtivo: { backgroundColor: colors.ocean },
  chipText: { color: colors.ocean, fontWeight: '700' },
  chipTextAtivo: { color: colors.white },
  erro: { color: colors.coral, marginBottom: 12, textAlign: 'center' },
  button: {
    width: '100%',
    backgroundColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
