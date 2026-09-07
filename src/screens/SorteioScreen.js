import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { colors, POSICOES } from '../theme';
import Screen from '../components/Screen';
import { sortearTimes } from '../utils/sorteio';

const POSICAO_LABEL = Object.fromEntries(POSICOES.map((p) => [p.value, p.label]));
const MIN_TIMES = 2;
const MAX_TIMES = 6;

export default function SorteioScreen() {
  const navigation = useNavigation();
  const [jogadores, setJogadores] = useState([]);
  const [presentes, setPresentes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [numTimes, setNumTimes] = useState(2);
  const [modo, setModo] = useState('balanceado');
  const [times, setTimes] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'jogadores'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('nome', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setJogadores(lista);
      setPresentes((atual) => {
        const novo = { ...atual };
        lista.forEach((j) => {
          if (!(j.id in novo)) novo[j.id] = true;
        });
        return novo;
      });
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  function alternarPresenca(id) {
    setPresentes((atual) => ({ ...atual, [id]: !atual[id] }));
  }

  const listaPresentes = jogadores.filter((j) => presentes[j.id]);

  function handleSortear() {
    if (listaPresentes.length < numTimes) {
      Alert.alert('Jogadores insuficientes', `Marque presença de pelo menos ${numTimes} jogadores.`);
      return;
    }
    setTimes(sortearTimes(listaPresentes, numTimes, modo));
  }

  async function handleSalvar() {
    if (!times) return;
    setSalvando(true);
    try {
      await addDoc(collection(db, 'peladas'), {
        ownerId: auth.currentUser.uid,
        modo,
        numTimes,
        times: times.map((time) => time.map((j) => ({ id: j.id, nome: j.nome, nivel: j.nivel, posicao: j.posicao }))),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Pelada salva no histórico!');
      navigation.navigate('Historico');
    } catch (e) {
      Alert.alert('Não deu pra salvar. Tenta de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen edges={['top']}>
      <FlatList
        contentContainerStyle={styles.lista}
        data={jogadores}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>🔀 Sortear times</Text>

            {carregando ? null : jogadores.length === 0 ? (
              <Text style={styles.emptyText}>
                Cadastre jogadores na aba "Jogadores" antes de sortear os times.
              </Text>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Quem vai jogar hoje?</Text>
                <Text style={styles.hint}>Toque pra marcar quem está ausente.</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) =>
          jogadores.length === 0 ? null : (
            <TouchableOpacity
              style={[styles.jogadorCard, !presentes[item.id] && styles.jogadorCardAusente]}
              onPress={() => alternarPresenca(item.id)}
            >
              <Text style={[styles.jogadorNome, !presentes[item.id] && styles.textoAusente]}>
                {presentes[item.id] ? '✅' : '⬜️'} {item.nome}
              </Text>
              <Text style={[styles.jogadorMeta, !presentes[item.id] && styles.textoAusente]}>
                Nível {item.nivel} · {POSICAO_LABEL[item.posicao] || item.posicao}
              </Text>
            </TouchableOpacity>
          )
        }
        ListFooterComponent={
          jogadores.length === 0 ? null : (
            <View>
              <Text style={styles.sectionLabel}>Número de times</Text>
              <View style={styles.row}>
                {Array.from({ length: MAX_TIMES - MIN_TIMES + 1 }, (_, i) => i + MIN_TIMES).map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, numTimes === n && styles.chipAtivo]}
                    onPress={() => setNumTimes(n)}
                  >
                    <Text style={[styles.chipText, numTimes === n && styles.chipTextAtivo]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Modo</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.chip, styles.chipModo, modo === 'balanceado' && styles.chipAtivo]}
                  onPress={() => setModo('balanceado')}
                >
                  <Text style={[styles.chipText, modo === 'balanceado' && styles.chipTextAtivo]}>
                    ⚖️ Balanceado
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, styles.chipModo, modo === 'aleatorio' && styles.chipAtivo]}
                  onPress={() => setModo('aleatorio')}
                >
                  <Text style={[styles.chipText, modo === 'aleatorio' && styles.chipTextAtivo]}>
                    🎲 Aleatório
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.contagem}>{listaPresentes.length} jogador(es) presente(s)</Text>

              <TouchableOpacity style={styles.button} onPress={handleSortear}>
                <Text style={styles.buttonText}>Sortear times</Text>
              </TouchableOpacity>

              {times && (
                <View style={styles.resultado}>
                  {times.map((time, i) => (
                    <View key={i} style={styles.timeCard}>
                      <Text style={styles.timeTitulo}>Time {i + 1}</Text>
                      {time.map((j) => (
                        <Text key={j.id} style={styles.timeJogador}>
                          {j.nome} — nível {j.nivel}
                        </Text>
                      ))}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecundario]}
                    onPress={handleSalvar}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>💾 Salvar no histórico</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  emptyText: { color: colors.inkSoft, fontSize: 15 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 16, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.inkSoft, marginBottom: 8 },
  jogadorCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  jogadorCardAusente: { opacity: 0.5 },
  jogadorNome: { fontSize: 15, fontWeight: '700', color: colors.ink },
  jogadorMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  textoAusente: { textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipModo: { flex: 1, alignItems: 'center' },
  chipAtivo: { backgroundColor: colors.ocean },
  chipText: { color: colors.ocean, fontWeight: '700' },
  chipTextAtivo: { color: colors.white },
  contagem: { textAlign: 'center', color: colors.inkSoft, marginTop: 16, marginBottom: 8 },
  button: {
    width: '100%',
    backgroundColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonSecundario: { backgroundColor: colors.navy, marginTop: 16 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  resultado: { marginTop: 20 },
  timeCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12 },
  timeTitulo: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  timeJogador: { fontSize: 13, color: colors.ink, marginBottom: 2 },
});
