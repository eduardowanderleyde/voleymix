import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import { db } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import { mostrarAlerta } from '../utils/alerta';
import { compartilharTimes } from '../utils/compartilhar';

const MODO_LABEL = { balanceado: '⚖️ Balanceado', aleatorio: '🎲 Aleatório' };

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

export default function PeladaDetalheScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [pelada, setPelada] = useState(route.params.pelada);
  const [marcandoVencedor, setMarcandoVencedor] = useState(false);

  // Recarrega do Firestore sempre que a tela ganha foco, pra refletir
  // avaliação/resultado marcados nesta sessão (ex: ao voltar da tela de avaliar).
  useFocusEffect(
    useCallback(() => {
      getDoc(doc(db, 'peladas', route.params.pelada.id)).then((snap) => {
        if (snap.exists()) setPelada({ id: snap.id, ...snap.data() });
      });
    }, [route.params.pelada.id])
  );

  async function handleMarcarVencedor(indice) {
    setMarcandoVencedor(true);
    try {
      const batch = writeBatch(db);
      pelada.times.forEach((time, i) => {
        const campo = i === indice ? 'vitorias' : 'derrotas';
        time.jogadores.forEach((j) => {
          batch.update(doc(db, 'jogadores', j.id), { [campo]: increment(1) });
        });
      });
      batch.update(doc(db, 'peladas', pelada.id), { vencedorIndex: indice });
      await batch.commit();
      setPelada((atual) => ({ ...atual, vencedorIndex: indice }));
    } catch (e) {
      mostrarAlerta('Não deu pra marcar o resultado.', e.message);
    } finally {
      setMarcandoVencedor(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cabecalhoRow}>
          <View>
            {!!pelada.sessaoTitulo && <Text style={styles.sessaoTag}>{pelada.sessaoTitulo}</Text>}
            <Text style={styles.data}>{formatarData(pelada.createdAt)}</Text>
            <Text style={styles.meta}>{MODO_LABEL[pelada.modo] || pelada.modo}</Text>
          </View>
          <TouchableOpacity
            style={styles.compartilharButton}
            onPress={() => compartilharTimes(pelada.times, { modo: pelada.modo, data: formatarData(pelada.createdAt) })}
          >
            <Feather name="share-2" size={16} color={colors.ocean} />
          </TouchableOpacity>
        </View>

        {pelada.avaliadaEm ? (
          <View style={styles.avaliadaBox}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={styles.avaliadaTexto}>Jogadores já avaliados</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.avaliarButton}
            onPress={() => navigation.navigate('AvaliarPelada', { pelada })}
          >
            <Feather name="star" size={14} color={colors.ocean} />
            <Text style={styles.avaliarButtonText}>Avaliar jogadores dessa pelada</Text>
          </TouchableOpacity>
        )}

        <View style={styles.resultadoCard}>
          <Text style={styles.resultadoLabel}>Resultado</Text>
          {pelada.vencedorIndex != null ? (
            <View style={styles.vencedorBox}>
              <Feather name="award" size={14} color="#8A6200" />
              <Text style={styles.vencedorTexto}>Time {pelada.vencedorIndex + 1} venceu</Text>
            </View>
          ) : marcandoVencedor ? (
            <ActivityIndicator color={colors.ocean} />
          ) : (
            <>
              <Text style={styles.resultadoHint}>Qual time ganhou?</Text>
              <View style={styles.resultadoRow}>
                {pelada.times.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.vencedorChip}
                    onPress={() => handleMarcarVencedor(i)}
                  >
                    <Text style={styles.vencedorChipText}>Time {i + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {pelada.times.map((time, i) => (
          <View key={i} style={styles.timeCard}>
            <View style={styles.timeTituloRow}>
              <Text style={styles.timeTitulo}>Time {i + 1}</Text>
              {pelada.vencedorIndex === i && <Feather name="award" size={14} color="#8A6200" />}
            </View>
            {time.jogadores.map((j) => (
              <Text key={j.id} style={styles.jogador}>
                {j.nome} — nível {j.nivelMedio}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  cabecalhoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  compartilharButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.ocean,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessaoTag: { fontSize: 12, color: colors.ocean, fontWeight: '700' },
  data: { fontSize: 18, fontWeight: '700', color: colors.navy },
  meta: { fontSize: 14, color: colors.inkSoft, marginBottom: 16 },
  avaliarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  avaliarButtonText: { color: colors.ocean, fontWeight: '700', fontSize: 13 },
  avaliadaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  avaliadaTexto: { color: colors.success, fontWeight: '600', fontSize: 13 },
  resultadoCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 16, ...cardShadow },
  resultadoLabel: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  resultadoHint: { fontSize: 12, color: colors.inkSoft, marginBottom: 8 },
  resultadoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vencedorChip: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  vencedorChipText: { color: colors.ocean, fontWeight: '700', fontSize: 12 },
  vencedorBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vencedorTexto: { color: '#8A6200', fontWeight: '700', fontSize: 13 },
  timeCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12, ...cardShadow },
  timeTituloRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  timeTitulo: { fontSize: 15, fontWeight: '700', color: colors.navy },
  jogador: { fontSize: 14, color: colors.ink, marginBottom: 2 },
});
