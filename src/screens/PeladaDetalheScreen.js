import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import { db } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import AuthBackground from '../components/AuthBackground';
import TimeCard from '../components/TimeCard';
import { mostrarAlerta } from '../utils/alerta';
import { mostrarToast } from '../utils/toast';
import { compartilharTimes } from '../utils/compartilhar';

const MODO_LABEL = { balanceado: 'Balanceado', aleatorio: 'Aleatório' };

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
  const [marcandoResultado, setMarcandoResultado] = useState(false);

  // Recarrega do Firestore sempre que a tela ganha foco, pra refletir
  // avaliação/resultado marcados nesta sessão (ex: ao voltar da tela de avaliar).
  useFocusEffect(
    useCallback(() => {
      getDoc(doc(db, 'peladas', route.params.pelada.id)).then((snap) => {
        if (snap.exists()) setPelada({ id: snap.id, ...snap.data() });
      });
    }, [route.params.pelada.id])
  );

  async function handleMarcarResultado(valor) {
    setMarcandoResultado(true);
    try {
      const batch = writeBatch(db);
      // Empate não mexe em retrospecto de ninguém — só registra o resultado.
      if (typeof valor === 'number') {
        pelada.times.forEach((time, i) => {
          const campo = i === valor ? 'vitorias' : 'derrotas';
          time.jogadores.forEach((j) => {
            batch.update(doc(db, 'jogadores', j.id), { [campo]: increment(1) });
          });
        });
      }
      batch.update(doc(db, 'peladas', pelada.id), { vencedorIndex: valor });
      await batch.commit();
      setPelada((atual) => ({ ...atual, vencedorIndex: valor }));
      mostrarToast('Resultado registrado!');
    } catch (e) {
      mostrarAlerta('Não deu pra marcar o resultado.', e.message);
    } finally {
      setMarcandoResultado(false);
    }
  }

  const venceuEmpate = pelada.vencedorIndex === 'empate';

  return (
    <Screen edges={['bottom']}>
      <AuthBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.cabecalhoRow}>
            <View>
              {!!pelada.sessaoTitulo && <Text style={styles.sessaoTag}>{pelada.sessaoTitulo}</Text>}
              <Text style={styles.data}>{formatarData(pelada.createdAt)}</Text>
              <Text style={styles.meta}>{MODO_LABEL[pelada.modo] || pelada.modo}</Text>
            </View>
          </View>

          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoLabel}>Resultado</Text>
            {pelada.vencedorIndex != null ? (
              <View style={styles.vencedorBox}>
                <Feather name="award" size={14} color="#8A6200" />
                <Text style={styles.vencedorTexto}>
                  {venceuEmpate ? 'Empate' : `Time ${pelada.vencedorIndex + 1} venceu`}
                </Text>
              </View>
            ) : marcandoResultado ? (
              <ActivityIndicator color={colors.ocean} />
            ) : (
              <>
                <Text style={styles.resultadoHint}>Quem venceu?</Text>
                <View style={styles.resultadoRow}>
                  {pelada.times.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.vencedorChip}
                      onPress={() => handleMarcarResultado(i)}
                    >
                      <Text style={styles.vencedorChipText}>Time {i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.vencedorChip}
                    onPress={() => handleMarcarResultado('empate')}
                  >
                    <Text style={styles.vencedorChipText}>Empate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <View style={styles.timesGrid}>
            {pelada.times.map((time, i) => (
              <TimeCard
                key={i}
                numero={i + 1}
                jogadores={time.jogadores}
                corIndex={i}
                destaque={pelada.vencedorIndex === i}
              />
            ))}
          </View>

          <View style={styles.acoesRow}>
            <TouchableOpacity
              style={styles.buttonCompartilhar}
              onPress={() =>
                compartilharTimes(pelada.times, { modo: pelada.modo, data: formatarData(pelada.createdAt) })
              }
            >
              <Feather name="share-2" size={16} color={colors.ocean} />
              <Text style={styles.buttonCompartilharText}>Compartilhar</Text>
            </TouchableOpacity>

            {pelada.avaliadaEm ? (
              <View style={styles.avaliadaBox}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={styles.avaliadaTexto}>Já avaliados</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.buttonAvaliar}
                onPress={() => navigation.navigate('AvaliarPelada', { pelada })}
              >
                <Feather name="star" size={14} color={colors.white} />
                <Text style={styles.buttonAvaliarText}>Avaliar jogadores</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  cabecalhoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sessaoTag: { fontSize: 12, color: colors.ocean, fontWeight: '700' },
  data: { fontSize: 20, fontWeight: '800', color: colors.navy },
  meta: { fontSize: 14, color: colors.inkSoft, marginBottom: 16 },
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
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  acoesRow: { flexDirection: 'row', gap: 10 },
  buttonCompartilhar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 13,
  },
  buttonCompartilharText: { color: colors.ocean, fontWeight: '700', fontSize: 14 },
  buttonAvaliar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 13,
  },
  buttonAvaliarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  avaliadaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  avaliadaTexto: { color: colors.success, fontWeight: '600', fontSize: 13 },
});
