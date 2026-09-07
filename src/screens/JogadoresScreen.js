import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { colors, POSICOES } from '../theme';
import Screen from '../components/Screen';

const POSICAO_LABEL = Object.fromEntries(POSICOES.map((p) => [p.value, p.label]));

export default function JogadoresScreen() {
  const navigation = useNavigation();
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'jogadores'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('nome', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJogadores(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  function confirmarExclusao(jogador) {
    Alert.alert('Remover jogador', `Remover ${jogador.nome} da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteDoc(doc(db, 'jogadores', jogador.id)) },
    ]);
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>🏐 Jogadores</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NovoJogador')}>
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ocean} />
        </View>
      ) : jogadores.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum jogador cadastrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.lista}
          data={jogadores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('NovoJogador', { jogador: item })}
              onLongPress={() => confirmarExclusao(item)}
            >
              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.posicao}>{POSICAO_LABEL[item.posicao] || item.posicao}</Text>
              </View>
              <View style={styles.nivelBadge}>
                <Text style={styles.nivelText}>Nível {item.nivel}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.navy },
  addButton: { backgroundColor: colors.ocean, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 16 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: '700', color: colors.ink },
  posicao: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  nivelBadge: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  nivelText: { color: colors.navy, fontWeight: '700', fontSize: 12 },
});
