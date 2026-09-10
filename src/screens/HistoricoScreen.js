import { useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, deleteDoc } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import { db } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import AuthBackground from '../components/AuthBackground';
import EmptyState from '../components/EmptyState';
import { useMinhaColecao } from '../hooks/useMinhaColecao';
import { confirmarAcao, mostrarAlerta } from '../utils/alerta';
import { mostrarToast } from '../utils/toast';

const MODO_LABEL = { balanceado: 'Balanceado', aleatorio: 'Aleatório' };
const MIN_PELADAS_PARA_RANKING = 3;

function formatarData(timestamp) {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoricoScreen() {
  const navigation = useNavigation();
  const { dados: peladas, carregando } = useMinhaColecao(
    'peladas',
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );

  const estatisticas = useMemo(() => {
    const presencas = new Map();
    const vitorias = new Map();
    peladas.forEach((pelada) => {
      pelada.times?.forEach((time, i) => {
        time.jogadores?.forEach((jogador) => {
          const atual = presencas.get(jogador.id) ?? { nome: jogador.nome, vezes: 0 };
          atual.vezes += 1;
          atual.nome = jogador.nome;
          presencas.set(jogador.id, atual);

          if (pelada.vencedorIndex === i) {
            const atualV = vitorias.get(jogador.id) ?? { nome: jogador.nome, vezes: 0 };
            atualV.vezes += 1;
            atualV.nome = jogador.nome;
            vitorias.set(jogador.id, atualV);
          }
        });
      });
    });
    const ranking = Array.from(presencas.values()).sort((a, b) => b.vezes - a.vezes).slice(0, 5);
    const maxVezes = ranking[0]?.vezes || 1;
    const rankingVitorias = Array.from(vitorias.values()).sort((a, b) => b.vezes - a.vezes).slice(0, 5);
    const maxVitorias = rankingVitorias[0]?.vezes || 1;
    return { totalPeladas: peladas.length, ranking, maxVezes, rankingVitorias, maxVitorias };
  }, [peladas]);

  function handleExcluir(pelada) {
    confirmarAcao('Excluir pelada', 'Isso remove essa pelada do histórico. Não dá pra desfazer.', async () => {
      try {
        await deleteDoc(doc(db, 'peladas', pelada.id));
        mostrarToast('Pelada excluída.');
      } catch (e) {
        mostrarAlerta('Não deu pra excluir. Tenta de novo.', e.message);
      }
    });
  }

  return (
    <Screen edges={['bottom']}>
      <AuthBackground />
      <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Histórico de peladas</Text>
        <Text style={styles.subtitle}>Reveja os times sorteados em cada pelada.</Text>
      </View>

      {!carregando && estatisticas.totalPeladas > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <Feather name="bar-chart-2" size={16} color={colors.navy} />
            <Text style={styles.statsTitulo}>Estatísticas do grupo</Text>
          </View>
          <Text style={styles.statsTotal}>
            {estatisticas.totalPeladas} pelada{estatisticas.totalPeladas > 1 ? 's' : ''} registrada
            {estatisticas.totalPeladas > 1 ? 's' : ''}
          </Text>

          {estatisticas.totalPeladas < MIN_PELADAS_PARA_RANKING ? (
            <Text style={styles.statsAviso}>
              Mais estatísticas disponíveis após {MIN_PELADAS_PARA_RANKING} peladas salvas.
            </Text>
          ) : (
            <>
              <Text style={styles.statsSubtitulo}>Mais presentes</Text>
          {estatisticas.ranking.map((jogador, i) => (
            <View key={jogador.nome + i} style={styles.rankingLinha}>
              <Text style={styles.rankingPosicao}>{i + 1}º</Text>
              <Text style={styles.rankingNome} numberOfLines={1}>
                {jogador.nome}
              </Text>
              <View style={styles.rankingBarraFundo}>
                <View
                  style={[
                    styles.rankingBarraPreenchida,
                    { width: `${(jogador.vezes / estatisticas.maxVezes) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.rankingVezes}>{jogador.vezes}x</Text>
            </View>
          ))}

          {estatisticas.rankingVitorias.length > 0 && (
            <>
              <Text style={[styles.statsSubtitulo, { marginTop: 14 }]}>Mais vitórias</Text>
              {estatisticas.rankingVitorias.map((jogador, i) => (
                <View key={jogador.nome + i} style={styles.rankingLinha}>
                  <Text style={styles.rankingPosicao}>{i + 1}º</Text>
                  <Text style={styles.rankingNome} numberOfLines={1}>
                    {jogador.nome}
                  </Text>
                  <View style={styles.rankingBarraFundo}>
                    <View
                      style={[
                        styles.rankingBarraPreenchida,
                        styles.rankingBarraVitoria,
                        { width: `${(jogador.vezes / estatisticas.maxVitorias) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankingVezes}>{jogador.vezes}x</Text>
                </View>
              ))}
            </>
          )}
            </>
          )}
        </View>
      )}

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ocean} />
        </View>
      ) : peladas.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title="Nenhuma pelada salva"
          description="Sorteie os times de uma pelada e ela aparece aqui, com histórico e estatísticas do grupo."
          buttonLabel="Sortear times agora"
          buttonIcon="shuffle"
          onPress={() => navigation.navigate('Sorteio')}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.lista}
          data={peladas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const totalJogadores = item.times?.reduce((soma, t) => soma + (t.jogadores?.length || 0), 0) || 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('PeladaDetalhe', { pelada: item })}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopo}>
                  <Text style={styles.data}>{formatarData(item.createdAt)}</Text>
                  <View style={styles.cardTopoDireita}>
                    {item.vencedorIndex != null && <Feather name="award" size={14} color="#8A6200" />}
                    <Feather name="chevron-right" size={16} color={colors.inkSoft} />
                  </View>
                </View>
                {!!item.sessaoTitulo && <Text style={styles.sessaoTag}>{item.sessaoTitulo}</Text>}
                <Text style={styles.meta}>
                  {totalJogadores} jogadores • {item.numTimes} times • {MODO_LABEL[item.modo] || item.modo}
                </Text>

                <View style={styles.cardAcoesRow}>
                  <TouchableOpacity
                    style={styles.cardAcaoBotao}
                    onPress={() => navigation.navigate('PeladaDetalhe', { pelada: item })}
                  >
                    <Feather name="eye" size={13} color={colors.ocean} />
                    <Text style={styles.cardAcaoTexto}>Ver times</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardAcaoBotao}
                    onPress={() => navigation.navigate('Sorteio', { repetir: item })}
                  >
                    <Feather name="repeat" size={13} color={colors.ocean} />
                    <Text style={styles.cardAcaoTexto}>Repetir sorteio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardAcaoBotao} onPress={() => handleExcluir(item)}>
                    <Feather name="trash-2" size={13} color={colors.coral} />
                    <Text style={[styles.cardAcaoTexto, { color: colors.coral }]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 1180, alignSelf: 'center' },
  headerWrap: { padding: 16, paddingBottom: 8 },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...cardShadow,
  },
  statsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsTitulo: { fontSize: 14, fontWeight: '700', color: colors.navy },
  statsTotal: { fontSize: 12, color: colors.inkSoft, marginTop: 2, marginBottom: 4 },
  statsAviso: { fontSize: 12, color: colors.inkSoft, fontStyle: 'italic' },
  statsSubtitulo: { fontSize: 12, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  rankingLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rankingPosicao: { width: 20, fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  rankingNome: { width: 90, fontSize: 12, color: colors.ink },
  rankingBarraFundo: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  rankingBarraPreenchida: { height: '100%', borderRadius: 3, backgroundColor: colors.sun },
  rankingBarraVitoria: { backgroundColor: colors.ocean },
  rankingVezes: { width: 28, fontSize: 11, color: colors.inkSoft, textAlign: 'right' },
  header: { fontSize: 20, fontWeight: '700', color: colors.navy },
  subtitle: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lista: { paddingHorizontal: 16, paddingBottom: 90, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    ...cardShadow,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTopoDireita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessaoTag: { fontSize: 12, color: colors.ocean, fontWeight: '700', marginTop: 2 },
  data: { fontSize: 15, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 2, marginBottom: 10 },
  cardAcoesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  cardAcaoBotao: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardAcaoTexto: { fontSize: 12, fontWeight: '700', color: colors.ocean },
});
