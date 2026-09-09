import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { colors, cardShadow, DIAS_SEMANA } from '../theme';
import Screen from '../components/Screen';
import AuthBackground from '../components/AuthBackground';
import EmptyState from '../components/EmptyState';
import { useMinhaColecao } from '../hooks/useMinhaColecao';

const DIA_LABEL = Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, d.label]));

function descreverQuando(sessao) {
  if (sessao.recorrente) {
    return `Toda ${DIA_LABEL[sessao.diaSemana]}${sessao.horario ? `, ${sessao.horario}` : ''}`;
  }
  return [sessao.data, sessao.horario].filter(Boolean).join(', ') || 'Data a combinar';
}

export default function SessoesScreen() {
  const navigation = useNavigation();
  const { dados: sessoes, carregando } = useMinhaColecao(
    'sessoes',
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );

  return (
    <Screen edges={['bottom']}>
      <AuthBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Sessões</Text>
            <Text style={styles.subtitle}>Organize suas peladas recorrentes</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NovaSessao')}>
            <Feather name="plus" size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Nova sessão</Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.ocean} />
          </View>
        ) : sessoes.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Nenhuma sessão criada"
            description="Crie uma pelada recorrente, defina dia e horário e reutilize sua lista de jogadores."
            buttonLabel="Criar primeira sessão"
            onPress={() => navigation.navigate('NovaSessao')}
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.lista}
            data={sessoes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const confirmados = Object.values(item.presentes || {}).filter(Boolean).length;
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('SessaoDetalhe', { sessaoId: item.id })}
                >
                  <View style={styles.cardTopo}>
                    <Text style={styles.cardTitulo}>{item.titulo}</Text>
                    {!item.ativa && <Text style={styles.tagInativa}>arquivada</Text>}
                  </View>
                  <Text style={styles.cardQuando}>{descreverQuando(item)}</Text>
                  {!!item.local && (
                    <View style={styles.cardLocalRow}>
                      <Feather name="map-pin" size={12} color={colors.inkSoft} />
                      <Text style={styles.cardLocal}>{item.local}</Text>
                    </View>
                  )}
                  {confirmados > 0 && (
                    <View style={styles.confirmadosBadge}>
                      <Feather name="check-circle" size={12} color={colors.success} />
                      <Text style={styles.confirmadosTexto}>{confirmados} confirmado(s)</Text>
                    </View>
                  )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.navy },
  subtitle: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lista: { paddingHorizontal: 16, paddingBottom: 90, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, ...cardShadow },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitulo: { fontSize: 16, fontWeight: '700', color: colors.ink },
  tagInativa: { fontSize: 11, color: colors.inkSoft, fontStyle: 'italic' },
  cardQuando: { fontSize: 13, color: colors.ocean, fontWeight: '600', marginTop: 4 },
  cardLocalRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardLocal: { fontSize: 12, color: colors.inkSoft },
  confirmadosBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  confirmadosTexto: { fontSize: 12, color: colors.success, fontWeight: '600' },
});
