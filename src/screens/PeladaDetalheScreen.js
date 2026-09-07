import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import Screen from '../components/Screen';

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
  const route = useRoute();
  const { pelada } = route.params;

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.data}>{formatarData(pelada.createdAt)}</Text>
        <Text style={styles.meta}>{MODO_LABEL[pelada.modo] || pelada.modo}</Text>

        {pelada.times.map((time, i) => (
          <View key={i} style={styles.timeCard}>
            <Text style={styles.timeTitulo}>Time {i + 1}</Text>
            {time.map((j) => (
              <Text key={j.id} style={styles.jogador}>
                {j.nome} — nível {j.nivel}
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
  data: { fontSize: 18, fontWeight: '700', color: colors.navy },
  meta: { fontSize: 14, color: colors.inkSoft, marginBottom: 16 },
  timeCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12 },
  timeTitulo: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  jogador: { fontSize: 14, color: colors.ink, marginBottom: 2 },
});
