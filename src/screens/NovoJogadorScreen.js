import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { colors, NIVEIS, POSICOES, HABILIDADES, cardShadow, calcularNivelMedio } from '../theme';
import FormScreen from '../components/FormScreen';

function SeletorNota({ label, valor, onChange }) {
  return (
    <>
      <Text style={styles.label}>
        {label} ({valor})
      </Text>
      <View style={styles.row}>
        {NIVEIS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.chip, valor === n && styles.chipAtivo]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.chipText, valor === n && styles.chipTextAtivo]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

export default function NovoJogadorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const jogadorExistente = route.params?.jogador;

  const [nome, setNome] = useState(jogadorExistente?.nome ?? '');
  const [habilidades, setHabilidades] = useState(() =>
    Object.fromEntries(HABILIDADES.map((h) => [h.value, jogadorExistente?.[h.value] ?? 3]))
  );
  const [posicao, setPosicao] = useState(jogadorExistente?.posicao ?? 'qualquer');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function setHabilidade(chave, valor) {
    setHabilidades((atual) => ({ ...atual, [chave]: valor }));
  }

  async function handleSalvar() {
    setErro('');
    if (!nome.trim()) {
      setErro('Digite o nome do jogador.');
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        ...habilidades,
        nivelMedio: calcularNivelMedio(habilidades),
        posicao,
      };
      if (jogadorExistente) {
        await updateDoc(doc(db, 'jogadores', jogadorExistente.id), dados);
      } else {
        await addDoc(collection(db, 'jogadores'), {
          ownerId: auth.currentUser.uid,
          ...dados,
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
      <View style={styles.card}>
        <Text style={styles.title}>{jogadorExistente ? '✏️ Editar jogador' : '🏐 Novo jogador'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.inkSoft}
          value={nome}
          onChangeText={setNome}
        />

        {HABILIDADES.map((h) => (
          <SeletorNota
            key={h.value}
            label={h.label}
            valor={habilidades[h.value]}
            onChange={(n) => setHabilidade(h.value, n)}
          />
        ))}

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
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    ...cardShadow,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 4 },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
