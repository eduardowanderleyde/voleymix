import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, doc, deleteDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../config/firebase';
import { colors, POSICOES, GRUPO_POSICAO, HABILIDADES, cardShadow, categoriaJogador, calcularNivelMedio } from '../theme';
import Screen from '../components/Screen';
import { mostrarAlerta, confirmarAcao } from '../utils/alerta';
import { iniciais } from '../utils/iniciais';
import { useMinhaColecao } from '../hooks/useMinhaColecao';

const POSICAO_LABEL = Object.fromEntries(POSICOES.map((p) => [p.value, p.label]));

const JOGADORES_TESTE = [
  { nome: 'Ana', saque: 3, recepcao: 3, levantamento: 5, ataque: 3, bloqueio: 2, defesa: 3, posicao: 'levantador' },
  { nome: 'Bruno', saque: 4, recepcao: 2, levantamento: 3, ataque: 4, bloqueio: 3, defesa: 2, posicao: 'oposto' },
  { nome: 'Carla', saque: 4, recepcao: 4, levantamento: 3, ataque: 5, bloqueio: 3, defesa: 4, posicao: 'ponteiro' },
  { nome: 'Diego', saque: 2, recepcao: 3, levantamento: 2, ataque: 2, bloqueio: 2, defesa: 2, posicao: 'ponteiro' },
  { nome: 'Elisa', saque: 3, recepcao: 2, levantamento: 3, ataque: 4, bloqueio: 5, defesa: 4, posicao: 'central' },
  { nome: 'Fábio', saque: 3, recepcao: 2, levantamento: 2, ataque: 3, bloqueio: 4, defesa: 3, posicao: 'central' },
  { nome: 'Gabriela', saque: 2, recepcao: 5, levantamento: 4, ataque: 2, bloqueio: 1, defesa: 5, posicao: 'libero' },
  { nome: 'Hugo', saque: 2, recepcao: 3, levantamento: 3, ataque: 2, bloqueio: 2, defesa: 2, posicao: 'levantador' },
  { nome: 'Ivana', saque: 4, recepcao: 3, levantamento: 3, ataque: 4, bloqueio: 3, defesa: 3, posicao: 'oposto' },
  { nome: 'João', saque: 3, recepcao: 3, levantamento: 3, ataque: 3, bloqueio: 3, defesa: 3, posicao: 'ponteiro' },
  { nome: 'Karina', saque: 5, recepcao: 4, levantamento: 4, ataque: 5, bloqueio: 5, defesa: 5, posicao: 'central' },
  { nome: 'Lucas', saque: 2, recepcao: 2, levantamento: 2, ataque: 2, bloqueio: 2, defesa: 2, posicao: 'qualquer' },
];

function BarraNota({ label, valor }) {
  return (
    <View style={styles.barraLinha}>
      <Text style={styles.barraLabel}>{label}</Text>
      <View style={styles.barraSegmentos}>
        {[1, 2, 3, 4, 5].map((n) => (
          <View key={n} style={[styles.segmento, n <= valor && styles.segmentoAtivo]} />
        ))}
      </View>
    </View>
  );
}

export default function JogadoresScreen() {
  const navigation = useNavigation();
  const { dados: jogadores, carregando } = useMinhaColecao('jogadores', (a, b) => a.nome.localeCompare(b.nome));
  const [semeando, setSemeando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroPosicao, setFiltroPosicao] = useState('todas');

  const stats = useMemo(() => {
    const contagem = { levantadores: 0, atacantes: 0, defensores: 0, curingas: 0 };
    jogadores.forEach((j) => {
      const grupo = GRUPO_POSICAO[j.posicao];
      if (grupo) contagem[grupo] += 1;
      else contagem.curingas += 1; // posição "Qualquer" (ou não mapeada)
    });
    return { total: jogadores.length, ...contagem };
  }, [jogadores]);

  const jogadoresFiltrados = useMemo(() => {
    return jogadores.filter((j) => {
      const combinaBusca = j.nome.toLowerCase().includes(busca.trim().toLowerCase());
      const combinaPosicao = filtroPosicao === 'todas' || j.posicao === filtroPosicao;
      return combinaBusca && combinaPosicao;
    });
  }, [jogadores, busca, filtroPosicao]);

  async function handleSemearTeste() {
    setSemeando(true);
    try {
      await Promise.all(
        JOGADORES_TESTE.map((j) =>
          addDoc(collection(db, 'jogadores'), {
            ownerId: auth.currentUser.uid,
            ...j,
            nivelMedio: calcularNivelMedio(j),
            createdAt: serverTimestamp(),
          })
        )
      );
    } catch (e) {
      mostrarAlerta('Não deu pra criar os jogadores de teste.', e.message);
    } finally {
      setSemeando(false);
    }
  }

  function handleRecriarTeste() {
    confirmarAcao(
      'Recriar dados de teste',
      'Isso remove todos os seus jogadores atuais e cria 12 novos de exemplo.',
      async () => {
        setSemeando(true);
        try {
          const snapshot = await getDocs(
            query(collection(db, 'jogadores'), where('ownerId', '==', auth.currentUser.uid))
          );
          await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
          await handleSemearTeste();
        } catch (e) {
          mostrarAlerta('Não deu pra recriar os jogadores de teste.', e.message);
        } finally {
          setSemeando(false);
        }
      }
    );
  }

  function confirmarExclusao(jogador) {
    confirmarAcao('Remover jogador', `Remover ${jogador.nome} da lista?`, () =>
      deleteDoc(doc(db, 'jogadores', jogador.id))
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>🏐 Jogadores</Text>
            <Text style={styles.subtitle}>Gerencie os participantes da sua pelada.</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NovoJogador')}>
            <Feather name="plus" size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Adicionar jogador</Text>
          </TouchableOpacity>
        </View>

        {jogadores.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Feather name="users" size={18} color={colors.navy} />
              <Text style={styles.statNumero}>{stats.total}</Text>
              <Text style={styles.statLabel}>jogadores</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="compass" size={18} color={colors.ocean} />
              <Text style={styles.statNumero}>{stats.levantadores}</Text>
              <Text style={styles.statLabel}>levantadores</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="zap" size={18} color={colors.sun} />
              <Text style={styles.statNumero}>{stats.atacantes}</Text>
              <Text style={styles.statLabel}>atacantes</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="shield" size={18} color={colors.coral} />
              <Text style={styles.statNumero}>{stats.defensores}</Text>
              <Text style={styles.statLabel}>defensores</Text>
            </View>
            {stats.curingas > 0 && (
              <View style={styles.statCard}>
                <Feather name="shuffle" size={18} color={colors.inkSoft} />
                <Text style={styles.statNumero}>{stats.curingas}</Text>
                <Text style={styles.statLabel}>curingas</Text>
              </View>
            )}
          </View>
        )}

        {jogadores.length > 0 && (
          <>
            <View style={styles.buscaRow}>
              <Feather name="search" size={16} color={colors.inkSoft} />
              <TextInput
                style={styles.buscaInput}
                placeholder="Buscar jogador..."
                placeholderTextColor={colors.inkSoft}
                value={busca}
                onChangeText={setBusca}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
              <TouchableOpacity
                style={[styles.filtroChip, filtroPosicao === 'todas' && styles.filtroChipAtivo]}
                onPress={() => setFiltroPosicao('todas')}
              >
                <Text style={[styles.filtroChipText, filtroPosicao === 'todas' && styles.filtroChipTextAtivo]}>
                  Todas as posições
                </Text>
              </TouchableOpacity>
              {POSICOES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.filtroChip, filtroPosicao === p.value && styles.filtroChipAtivo]}
                  onPress={() => setFiltroPosicao(p.value)}
                >
                  <Text
                    style={[styles.filtroChipText, filtroPosicao === p.value && styles.filtroChipTextAtivo]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.ocean} />
          </View>
        ) : jogadores.length === 0 ? (
          <View style={styles.center}>
            <Feather name="users" size={32} color={colors.inkSoft} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>Nenhum jogador cadastrado ainda.</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('NovoJogador')}
            >
              <Feather name="plus" size={16} color={colors.white} />
              <Text style={styles.addButtonText}>Adicionar jogador</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.seedButton} onPress={handleSemearTeste} disabled={semeando}>
              {semeando ? (
                <ActivityIndicator color={colors.navy} />
              ) : (
                <Text style={styles.seedButtonText}>ou adicionar 12 jogadores de teste</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {jogadoresFiltrados.map((item, index) => {
                const categoria = categoriaJogador(item.nivelMedio ?? 3);
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardTopo}>
                      <View style={[styles.avatar, { backgroundColor: index % 2 === 0 ? colors.navy : colors.ocean }]}>
                        <Text style={styles.avatarText}>{iniciais(item.nome)}</Text>
                      </View>
                      <View style={styles.cardAcoes}>
                        <TouchableOpacity
                          onPress={() => navigation.navigate('NovoJogador', { jogador: item })}
                          hitSlop={8}
                        >
                          <Feather name="edit-2" size={16} color={colors.inkSoft} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmarExclusao(item)} hitSlop={8}>
                          <Feather name="trash-2" size={16} color={colors.coral} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.nome}>{item.nome}</Text>
                    <View style={styles.badgesRow}>
                      <View style={[styles.categoriaBadge, { backgroundColor: categoria.bg }]}>
                        <Text style={[styles.categoriaText, { color: categoria.text }]}>{categoria.label}</Text>
                      </View>
                      {item.qtdAvaliacoes > 0 && (
                        <View style={styles.reputacaoBadge}>
                          <Feather name="star" size={10} color="#8A6200" />
                          <Text style={styles.reputacaoText}>
                            {(item.somaAvaliacoes / item.qtdAvaliacoes).toFixed(1)} ({item.qtdAvaliacoes})
                          </Text>
                        </View>
                      )}
                      {(item.vitorias > 0 || item.derrotas > 0) && (
                        <View style={styles.retrospectoBadge}>
                          <Feather name="award" size={10} color={colors.inkSoft} />
                          <Text style={styles.retrospectoText}>
                            {item.vitorias || 0}V · {item.derrotas || 0}D
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.posicao}>{POSICAO_LABEL[item.posicao] || item.posicao}</Text>

                    <View style={styles.barrasGrid}>
                      {HABILIDADES.map((h) => (
                        <BarraNota key={h.value} label={h.label} valor={item[h.value] ?? item.nivelMedio ?? 0} />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.resetLink} onPress={handleRecriarTeste} disabled={semeando}>
              <Feather name="refresh-cw" size={13} color={colors.inkSoft} />
              <Text style={styles.resetLinkText}>Recriar jogadores de teste</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTextWrap: { flex: 1, minWidth: 200 },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy },
  subtitle: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    ...cardShadow,
  },
  statNumero: { fontSize: 22, fontWeight: '800', color: colors.navy, marginTop: 6 },
  statLabel: { fontSize: 12, color: colors.inkSoft },
  buscaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  buscaInput: { flex: 1, color: colors.ink },
  filtrosScroll: { marginBottom: 16 },
  filtroChip: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  filtroChipAtivo: { backgroundColor: colors.ocean },
  filtroChipText: { color: colors.ocean, fontWeight: '600', fontSize: 12 },
  filtroChipTextAtivo: { color: colors.white },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 16, marginBottom: 16 },
  seedButton: {
    marginTop: 14,
    paddingVertical: 4,
  },
  seedButtonText: { color: colors.inkSoft, fontWeight: '600', fontSize: 13, textDecorationLine: 'underline' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexGrow: 1,
    flexBasis: 260,
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  cardAcoes: { flexDirection: 'row', gap: 12 },
  nome: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 10 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  categoriaBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  reputacaoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1CC',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  reputacaoText: { fontSize: 11, fontWeight: '700', color: '#8A6200' },
  retrospectoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.border,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  retrospectoText: { fontSize: 11, fontWeight: '700', color: colors.inkSoft },
  categoriaText: { fontSize: 11, fontWeight: '700' },
  posicao: { fontSize: 12, color: colors.inkSoft, marginTop: 6, marginBottom: 10 },
  barrasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  barraLinha: { width: '46%', marginBottom: 6 },
  barraLabel: { fontSize: 11, color: colors.inkSoft, marginBottom: 3 },
  barraSegmentos: { flexDirection: 'row', gap: 3 },
  segmento: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border },
  segmentoAtivo: { backgroundColor: colors.ocean },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  resetLinkText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
});
