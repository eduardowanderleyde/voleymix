import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, cardShadow, POSICOES } from '../theme';
import { posicoesFaltando } from '../utils/sorteio';

const POSICAO_LABEL = Object.fromEntries(POSICOES.map((p) => [p.value, p.label]));
const CORES_TIME = [colors.ocean, colors.sun, colors.coral, colors.navy, colors.success, colors.inkSoft];

export default function TimeCard({ numero, jogadores, destaque, corIndex }) {
  const media = jogadores.length
    ? (jogadores.reduce((soma, j) => soma + (j.nivelMedio ?? 3), 0) / jogadores.length).toFixed(1).replace('.', ',')
    : '0,0';
  const cor = CORES_TIME[(corIndex ?? numero - 1) % CORES_TIME.length];
  const faltas = posicoesFaltando(jogadores);
  const temAdaptacao = jogadores.some((j) => j.posicaoAdaptada);

  return (
    <View style={[styles.card, { borderTopColor: cor }]}>
      <View style={styles.tituloRow}>
        <Text style={styles.titulo}>
          Time {numero} <Text style={styles.media}>— média {media}</Text>
        </Text>
        {destaque && <Feather name="award" size={14} color="#8A6200" />}
      </View>

      {jogadores.map((j) => (
        <View key={j.id} style={styles.jogadorRow}>
          <Text style={styles.jogadorNome} numberOfLines={1}>
            {j.nome}
          </Text>
          <View style={styles.tags}>
            <Text style={styles.tag}>
              {POSICAO_LABEL[j.posicaoAdaptada || j.posicao] || j.posicao}
              {j.posicaoAdaptada ? ' (adaptado)' : ''}
            </Text>
            <Text style={[styles.tag, styles.tagNivel]}>Nível {j.nivelMedio ?? 3}</Text>
          </View>
        </View>
      ))}

      <View style={styles.statusRow}>
        <Feather
          name={faltas.length ? 'alert-triangle' : 'check-circle'}
          size={12}
          color={faltas.length ? colors.coral : colors.success}
        />
        <Text style={faltas.length ? styles.statusAviso : styles.statusCompleto}>
          {faltas.length
            ? `Faltando: ${faltas.map(({ posicao, falta }) => `${falta}x ${POSICAO_LABEL[posicao]}`).join(', ')}`
            : temAdaptacao
              ? 'Formação completa (com adaptação)'
              : 'Formação completa'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderTopWidth: 4,
    padding: 14,
    ...cardShadow,
  },
  tituloRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  titulo: { fontSize: 15, fontWeight: '700', color: colors.navy },
  media: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  jogadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  jogadorNome: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
  tags: { flexDirection: 'row', gap: 4 },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSoft,
    backgroundColor: colors.sand,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  tagNivel: { color: colors.ocean, backgroundColor: colors.oceanTint },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  statusAviso: { fontSize: 12, color: colors.coral, fontWeight: '700' },
  statusCompleto: { fontSize: 12, color: colors.success, fontWeight: '700' },
});
