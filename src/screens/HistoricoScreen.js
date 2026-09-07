import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
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

export default function HistoricoScreen() {
  const navigation = useNavigation();
  const [peladas, setPeladas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'peladas'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPeladas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  return (
    <Screen edges={['top']}>
      <Text style={styles.header}>📋 Histórico de peladas</Text>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ocean} />
        </View>
      ) : peladas.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma pelada salva ainda.</Text>
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
  header: { fontSize: 20, fontWeight: '700', color: colors.navy, padding: 16, paddingBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 16 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  data: { fontSize: 15, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
});
