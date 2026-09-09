import { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../config/firebase';
import { colors, POSICOES, POSICAO_LABEL_PLURAL, cardShadow } from '../theme';
import Screen from '../components/Screen';
import { gerarSugestoes, posicoesFaltando, faltasGlobais, FORMACAO_IDEAL } from '../utils/sorteio';
import { mostrarAlerta } from '../utils/alerta';
import { iniciais } from '../utils/iniciais';
import { useMinhaColecao } from '../hooks/useMinhaColecao';

const POSICAO_LABEL = Object.fromEntries(POSICOES.map((p) => [p.value, p.label]));
const MIN_TIMES = 2;
const MAX_TIMES = 6;

export default function SorteioScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const largo = width >= 900;

  const { dados: jogadores, carregando } = useMinhaColecao('jogadores', (a, b) => a.nome.localeCompare(b.nome));
  const [presentes, setPresentes] = useState({});
  const [numTimes, setNumTimes] = useState(2);
  const [modo, setModo] = useState('balanceado');
  const [sugestoes, setSugestoes] = useState(null);
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const times = sugestoes?.[indiceSelecionado]?.times ?? null;

  useEffect(() => {
    setPresentes((atual) => {
      const novo = { ...atual };
      jogadores.forEach((j) => {
        if (!(j.id in novo)) novo[j.id] = true;
      });
      return novo;
    });
  }, [jogadores]);

  const listaPresentes = useMemo(() => jogadores.filter((j) => presentes[j.id]), [jogadores, presentes]);

  const composicao = useMemo(() => {
    return POSICOES.map((p) => {
      const count = listaPresentes.filter((j) => j.posicao === p.value).length;
      const necessario = (FORMACAO_IDEAL[p.value] || 0) * numTimes;
      return { posicao: p.value, label: POSICAO_LABEL_PLURAL[p.value], count, ok: count >= necessario };
    });
  }, [listaPresentes, numTimes]);

  const avisoFaltando = useMemo(() => faltasGlobais(listaPresentes, numTimes), [listaPresentes, numTimes]);

  function selecionarTodos(valor) {
    const novo = {};
    jogadores.forEach((j) => {
      novo[j.id] = valor;
    });
    setPresentes(novo);
    setSugestoes(null);
  }

  function alternarPresenca(id) {
    setPresentes((atual) => ({ ...atual, [id]: !atual[id] }));
    setSugestoes(null);
  }

  function handleSortear() {
    if (listaPresentes.length < numTimes) {
      mostrarAlerta('Jogadores insuficientes', `Marque presença de pelo menos ${numTimes} jogadores.`);
      return;
    }
    setSugestoes(gerarSugestoes(listaPresentes, numTimes, modo, 3));
    setIndiceSelecionado(0);
  }

  async function handleSalvar() {
    if (!times) return;
    setSalvando(true);
    try {
      await addDoc(collection(db, 'peladas'), {
        ownerId: auth.currentUser.uid,
        modo,
        numTimes,
        // Firestore não aceita array dentro de array: cada time vira um objeto com um campo "jogadores"
        times: times.map((time) => ({
          jogadores: time.map((j) => ({ id: j.id, nome: j.nome, nivelMedio: j.nivelMedio, posicao: j.posicao })),
        })),
        createdAt: serverTimestamp(),
      });
      mostrarAlerta('Pelada salva no histórico!');
      navigation.navigate('Historico');
    } catch (e) {
      mostrarAlerta('Não deu pra salvar. Tenta de novo.', e.message);
    } finally {
      setSalvando(false);
    }
  }

  const jogadoresPorTime = numTimes > 0 ? Math.floor(listaPresentes.length / numTimes) : 0;

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>🔀 Sortear times</Text>

          {carregando ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.ocean} />
            </View>
          ) : jogadores.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                Cadastre jogadores antes de sortear os times.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Jogadores')}
              >
                <Text style={styles.emptyButtonText}>Ir para Jogadores</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.resumoRow}>
                <View style={styles.resumoChip}>
                  <Text style={styles.resumoNumero}>{listaPresentes.length}</Text>
                  <Text style={styles.resumoLabel}>presentes</Text>
                </View>
                <View style={styles.resumoChip}>
                  <Text style={styles.resumoNumero}>{numTimes}</Text>
                  <Text style={styles.resumoLabel}>times</Text>
                </View>
                <View style={styles.resumoChip}>
                  <Text style={styles.resumoNumero}>{jogadoresPorTime}</Text>
                  <Text style={styles.resumoLabel}>por time</Text>
                </View>
                <View style={styles.resumoChip}>
                  <Text style={styles.resumoNumeroTexto}>
                    {modo === 'balanceado' ? '⚖️ Balanceado' : '🎲 Aleatório'}
                  </Text>
                  <Text style={styles.resumoLabel}>modo</Text>
                </View>
              </View>

              <View style={[styles.colunas, largo && styles.colunasLargo]}>
                <View style={[styles.colEsquerda, largo && styles.colEsquerdaLargo]}>
                  <View style={styles.colHeader}>
                    <Text style={styles.sectionLabel}>Quem vai jogar?</Text>
                    <View style={styles.colHeaderAcoes}>
                      <TouchableOpacity onPress={() => selecionarTodos(true)}>
                        <Text style={styles.linkAcao}>Selecionar todos</Text>
                      </TouchableOpacity>
                      <Text style={styles.separadorAcao}>·</Text>
                      <TouchableOpacity onPress={() => selecionarTodos(false)}>
                        <Text style={styles.linkAcao}>Limpar seleção</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.gridJogadores}>
                    {jogadores.map((item, index) => {
                      const ativo = !!presentes[item.id];
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.jogadorCard, ativo ? styles.jogadorCardAtivo : styles.jogadorCardInativo]}
                          onPress={() => alternarPresenca(item.id)}
                        >
                          <View style={styles.jogadorTopo}>
                            <View
                              style={[
                                styles.avatar,
                                { backgroundColor: index % 2 === 0 ? colors.navy : colors.ocean },
                                !ativo && styles.avatarInativo,
                              ]}
                            >
                              <Text style={styles.avatarText}>{iniciais(item.nome)}</Text>
                            </View>
                            <Feather
                              name={ativo ? 'check-square' : 'square'}
                              size={16}
                              color={ativo ? colors.ocean : colors.inkSoft}
                            />
                          </View>
                          <Text style={[styles.jogadorNome, !ativo && styles.textoInativo]} numberOfLines={1}>
                            {item.nome}
                          </Text>
                          <Text style={[styles.jogadorPosicao, !ativo && styles.textoInativo]}>
                            {POSICAO_LABEL[item.posicao] || item.posicao}
                          </Text>
                          <View style={styles.pontosRow}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <View
                                key={n}
                                style={[
                                  styles.ponto,
                                  n <= (item.nivelMedio ?? 0) && (ativo ? styles.pontoAtivo : styles.pontoInativo),
                                ]}
                              />
                            ))}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View
                  style={[
                    styles.colDireita,
                    largo && styles.colDireitaLargo,
                    largo && Platform.OS === 'web' && styles.colDireitaSticky,
                  ]}
                >
                  <View style={styles.painelCard}>
                    <Text style={styles.sectionLabel}>Número de times</Text>
                    <View style={styles.row}>
                      {Array.from({ length: MAX_TIMES - MIN_TIMES + 1 }, (_, i) => i + MIN_TIMES).map((n) => (
                        <TouchableOpacity
                          key={n}
                          style={[styles.numeroChip, numTimes === n && styles.numeroChipAtivo]}
                          onPress={() => {
                            setNumTimes(n);
                            setSugestoes(null);
                          }}
                        >
                          <Text style={[styles.numeroChipText, numTimes === n && styles.numeroChipTextAtivo]}>
                            {n}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Modo</Text>
                    <View style={styles.modoRow}>
                      <TouchableOpacity
                        style={[styles.modoCard, modo === 'balanceado' && styles.modoCardAtivo]}
                        onPress={() => setModo('balanceado')}
                      >
                        <Text style={styles.modoEmoji}>⚖️</Text>
                        <Text style={[styles.modoTexto, modo === 'balanceado' && styles.modoTextoAtivo]}>
                          Balanceado
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modoCard, modo === 'aleatorio' && styles.modoCardAtivo]}
                        onPress={() => setModo('aleatorio')}
                      >
                        <Text style={styles.modoEmoji}>🎲</Text>
                        <Text style={[styles.modoTexto, modo === 'aleatorio' && styles.modoTextoAtivo]}>
                          Aleatório
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Composição dos presentes</Text>
                    {composicao
                      .filter((c) => c.count > 0 || FORMACAO_IDEAL[c.posicao])
                      .map((c) => (
                        <View key={c.posicao} style={styles.composicaoLinha}>
                          <Feather
                            name={c.ok ? 'check-circle' : 'alert-triangle'}
                            size={14}
                            color={c.ok ? colors.ocean : colors.coral}
                          />
                          <Text style={[styles.composicaoTexto, !c.ok && styles.composicaoTextoAlerta]}>
                            {c.count} {c.label}
                          </Text>
                        </View>
                      ))}

                    {avisoFaltando.length > 0 && (
                      <View style={styles.avisoBox}>
                        <Text style={styles.avisoTexto}>
                          Atenção: falta{' '}
                          {avisoFaltando
                            .map((f) => `${f.falta}x ${POSICAO_LABEL[f.posicao]}`)
                            .join(', ')}{' '}
                          pra fechar {numTimes} times completos.
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleSortear}>
                      <Text style={styles.buttonText}>Sortear times</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {sugestoes && sugestoes.length > 0 && (
                <View style={styles.resultado}>
                  <View style={styles.resultadoHeader}>
                    <Text style={styles.sectionLabel}>Resultado</Text>
                    <TouchableOpacity style={styles.linkRegerar} onPress={handleSortear}>
                      <Feather name="refresh-cw" size={13} color={colors.ocean} />
                      <Text style={styles.linkAcao}>Gerar novas opções</Text>
                    </TouchableOpacity>
                  </View>

                  {sugestoes.length > 1 && (
                    <View style={styles.opcoesRow}>
                      {sugestoes.map((sugestao, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[styles.opcaoChip, indiceSelecionado === i && styles.opcaoChipAtiva]}
                          onPress={() => setIndiceSelecionado(i)}
                        >
                          <Text
                            style={[styles.opcaoChipText, indiceSelecionado === i && styles.opcaoChipTextAtiva]}
                          >
                            Opção {i + 1}
                          </Text>
                          {modo === 'balanceado' && (
                            <Text
                              style={[
                                styles.opcaoChipDiferenca,
                                indiceSelecionado === i && styles.opcaoChipTextAtiva,
                              ]}
                            >
                              diferença {sugestao.diferenca}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <View style={styles.resultadoGrid}>
                    {times.map((time, i) => {
                      const faltas = posicoesFaltando(time);
                      return (
                        <View key={i} style={styles.timeCard}>
                          <Text style={styles.timeTitulo}>Time {i + 1}</Text>
                          {time.map((j) => (
                            <Text key={j.id} style={styles.timeJogador}>
                              {j.nome} — nível {j.nivelMedio}
                            </Text>
                          ))}
                          <Text style={faltas.length ? styles.timeAviso : styles.timeCompleto}>
                            {faltas.length
                              ? `⚠️ Faltando: ${faltas
                                  .map(({ posicao, falta }) => `${falta}x ${POSICAO_LABEL[posicao]}`)
                                  .join(', ')}`
                              : '✅ Formação completa'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

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
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.inkSoft, fontSize: 15, marginBottom: 16 },
  emptyButton: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyButtonText: { color: colors.ocean, fontWeight: '700' },

  resumoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  resumoChip: {
    flexGrow: 1,
    flexBasis: 130,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    ...cardShadow,
  },
  resumoNumero: { fontSize: 22, fontWeight: '800', color: colors.navy },
  resumoNumeroTexto: { fontSize: 14, fontWeight: '800', color: colors.navy },
  resumoLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },

  colunas: { flexDirection: 'column', gap: 16 },
  colunasLargo: { flexDirection: 'row', alignItems: 'flex-start' },
  colEsquerda: { width: '100%' },
  colEsquerdaLargo: { flex: 1 },
  colDireita: { width: '100%' },
  colDireitaLargo: { width: 320 },
  colDireitaSticky: { position: 'sticky', top: 16 },

  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  colHeaderAcoes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  linkAcao: { fontSize: 12, color: colors.ocean, fontWeight: '700' },
  separadorAcao: { color: colors.inkSoft, fontSize: 12 },

  gridJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  jogadorCard: {
    flexGrow: 1,
    flexBasis: 140,
    maxWidth: 180,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  jogadorCardAtivo: { borderColor: colors.ocean, ...cardShadow },
  jogadorCardInativo: { borderColor: colors.border, opacity: 0.55 },
  jogadorTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarInativo: { backgroundColor: colors.inkSoft },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  jogadorNome: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 8 },
  jogadorPosicao: { fontSize: 11, color: colors.inkSoft, marginTop: 1, marginBottom: 6 },
  textoInativo: { textDecorationLine: 'line-through' },
  pontosRow: { flexDirection: 'row', gap: 3 },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  pontoAtivo: { backgroundColor: colors.sun },
  pontoInativo: { backgroundColor: colors.inkSoft },

  painelCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, ...cardShadow },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  numeroChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.ocean,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroChipAtivo: { backgroundColor: colors.ocean },
  numeroChipText: { color: colors.ocean, fontWeight: '700' },
  numeroChipTextAtivo: { color: colors.white },

  modoRow: { flexDirection: 'row', gap: 8 },
  modoCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  modoCardAtivo: { borderColor: colors.ocean, backgroundColor: colors.oceanTint },
  modoEmoji: { fontSize: 18, marginBottom: 4 },
  modoTexto: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  modoTextoAtivo: { color: colors.ocean },

  composicaoLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  composicaoTexto: { fontSize: 13, color: colors.ink },
  composicaoTextoAlerta: { color: colors.coral, fontWeight: '600' },

  avisoBox: {
    backgroundColor: colors.coralTint,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  avisoTexto: { color: colors.coral, fontSize: 12, fontWeight: '600' },

  button: {
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonSecundario: { backgroundColor: colors.navy, marginTop: 0 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },

  resultado: { marginTop: 24 },
  resultadoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkRegerar: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  opcoesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  opcaoChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  opcaoChipAtiva: { borderColor: colors.ocean, backgroundColor: colors.oceanTint },
  opcaoChipText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  opcaoChipTextAtiva: { color: colors.ocean },
  opcaoChipDiferenca: { fontSize: 10, color: colors.inkSoft, marginTop: 2 },
  resultadoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, marginBottom: 16 },
  timeCard: {
    flexGrow: 1,
    flexBasis: 220,
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    ...cardShadow,
  },
  timeTitulo: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  timeJogador: { fontSize: 13, color: colors.ink, marginBottom: 2 },
  timeAviso: { fontSize: 12, color: colors.coral, fontWeight: '700', marginTop: 8 },
  timeCompleto: { fontSize: 12, color: colors.success, fontWeight: '700', marginTop: 8 },
});
