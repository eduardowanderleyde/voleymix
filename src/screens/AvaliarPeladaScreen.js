import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { db } from '../config/firebase';
import { colors, NIVEIS, cardShadow } from '../theme';
import Screen from '../components/Screen';
import { mostrarAlerta } from '../utils/alerta';
import { iniciais } from '../utils/iniciais';

export default function AvaliarPeladaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { pelada } = route.params;

  const jogadores = pelada.times.flatMap((time) => time.jogadores);
  const [notas, setNotas] = useState({});
  const [salvando, setSalvando] = useState(false);

  function avaliar(jogadorId, nota) {
    setNotas((atual) => ({ ...atual, [jogadorId]: atual[jogadorId] === nota ? undefined : nota }));
  }

  async function handleSalvar() {
    const avaliados = Object.entries(notas).filter(([, nota]) => nota);
    if (avaliados.length === 0) {
      mostrarAlerta('Nenhuma avaliação', 'Dê uma nota pra pelo menos um jogador antes de salvar.');
      return;
    }

    setSalvando(true);
    try {
      const batch = writeBatch(db);
      avaliados.forEach(([jogadorId, nota]) => {
        batch.update(doc(db, 'jogadores', jogadorId), {
          somaAvaliacoes: increment(nota),
          qtdAvaliacoes: increment(1),
        });
      });
      batch.update(doc(db, 'peladas', pelada.id), { avaliadaEm: serverTimestamp() });
      await batch.commit();
      mostrarAlerta('Avaliações salvas!', `${avaliados.length} jogador(es) avaliado(s).`);
      navigation.goBack();
    } catch (e) {
      mostrarAlerta('Não deu pra salvar as avaliações.', e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (pelada.avaliadaEm) {
    return (
      <Screen edges={['bottom']}>
        <View style={styles.center}>
          <Feather name="check-circle" size={32} color={colors.success} style={{ marginBottom: 10 }} />
          <Text style={styles.jaAvaliadaTexto}>Essa pelada já foi avaliada.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>⭐ Avaliar jogadores</Text>
        <Text style={styles.subtitulo}>
          Dê uma nota de 1 a 5 pra como cada um jogou nessa pelada. Quem não avaliar, fica sem nota — sem
          problema.
        </Text>

        {jogadores.map((jogador, index) => (
          <View key={jogador.id} style={styles.card}>
            <View style={styles.cardTopo}>
              <View style={[styles.avatar, { backgroundColor: index % 2 === 0 ? colors.navy : colors.ocean }]}>
                <Text style={styles.avatarText}>{iniciais(jogador.nome)}</Text>
              </View>
              <Text style={styles.nome}>{jogador.nome}</Text>
            </View>
            <View style={styles.notasRow}>
              {NIVEIS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.notaChip, notas[jogador.id] === n && styles.notaChipAtiva]}
                  onPress={() => avaliar(jogador.id, n)}
                >
                  <Text style={[styles.notaChipText, notas[jogador.id] === n && styles.notaChipTextAtiva]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={salvando}>
          {salvando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Salvar avaliações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  jaAvaliadaTexto: { color: colors.inkSoft, fontSize: 15, textAlign: 'center' },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  subtitulo: { fontSize: 13, color: colors.inkSoft, marginBottom: 18, lineHeight: 18 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 12, ...cardShadow },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: colors.ink },
  notasRow: { flexDirection: 'row', gap: 8 },
  notaChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
  },
  notaChipAtiva: { borderColor: colors.sun, backgroundColor: '#FFF1CC' },
  notaChipText: { fontWeight: '700', color: colors.inkSoft },
  notaChipTextAtiva: { color: '#8A6200' },
  button: {
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
