import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import { useMinhaColecao } from '../hooks/useMinhaColecao';

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

export default function HistoricoScreen() {
  const navigation = useNavigation();
  const { dados: peladas, carregando } = useMinhaColecao(
    'peladas',
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );

  return (
    <Screen edges={['bottom']}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>📋 Histórico de peladas</Text>
        <Text style={styles.subtitle}>Reveja os times sorteados em cada pelada.</Text>
      </View>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ocean} />
        </View>
      ) : peladas.length === 0 ? (
        <View style={styles.center}>
          <Feather name="clipboard" size={32} color={colors.inkSoft} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyText}>Nenhuma pelada salva ainda.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Sorteio')}>
            <Text style={styles.emptyButtonText}>Sortear times agora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.lista}
          data={peladas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PeladaDetalhe', { pelada: item })}
            >
              <Text style={styles.data}>{formatarData(item.createdAt)}</Text>
              <Text style={styles.meta}>
                {item.numTimes} times · {MODO_LABEL[item.modo] || item.modo}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { padding: 16, paddingBottom: 8 },
  header: { fontSize: 20, fontWeight: '700', color: colors.navy },
  subtitle: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 16, marginBottom: 16 },
  emptyButton: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyButtonText: { color: colors.ocean, fontWeight: '700' },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    ...cardShadow,
  },
  data: { fontSize: 15, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
});
