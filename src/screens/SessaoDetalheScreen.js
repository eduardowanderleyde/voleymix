import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, query, where } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../config/firebase';
import { colors, DIAS_SEMANA, cardShadow } from '../theme';
import Screen from '../components/Screen';
import { mostrarAlerta, confirmarAcao } from '../utils/alerta';
import { iniciais } from '../utils/iniciais';
import { useMinhaColecao } from '../hooks/useMinhaColecao';

const DIA_LABEL = Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, d.label]));

function formatarData(timestamp) {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function SessaoDetalheScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessaoId } = route.params;

  const [sessao, setSessao] = useState(null);
  const [presentes, setPresentes] = useState({});
  const [salvando, setSalvando] = useState(false);
  const { dados: jogadores, carregando } = useMinhaColecao('jogadores', (a, b) => a.nome.localeCompare(b.nome));
  const { dados: peladasTodas } = useMinhaColecao('peladas');

  useEffect(() => {
    return onSnapshot(doc(db, 'sessoes', sessaoId), (snap) => {
      if (snap.exists()) {
        const dados = { id: snap.id, ...snap.data() };
        setSessao(dados);
        setPresentes(dados.presentes || {});
      }
    });
  }, [sessaoId]);

  const peladasDaSessao = useMemo(
    () => peladasTodas.filter((p) => p.sessaoId === sessaoId).sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [peladasTodas, sessaoId]
  );

  function alternarPresenca(id) {
    setPresentes((atual) => ({ ...atual, [id]: !atual[id] }));
  }

  async function salvarPresenca() {
    setSalvando(true);
    try {
      await updateDoc(doc(db, 'sessoes', sessaoId), { presentes });
      mostrarAlerta('Presença salva!');
    } catch (e) {
      mostrarAlerta('Não deu pra salvar.', e.message);
    } finally {
      setSalvando(false);
    }
  }

  function irParaSorteio() {
    navigation.navigate('Tabs', { screen: 'Sorteio', params: { sessao: { ...sessao, presentes } } });
  }

  function alternarArquivar() {
    updateDoc(doc(db, 'sessoes', sessaoId), { ativa: !sessao.ativa });
  }

  function excluirSessao() {
    confirmarAcao('Excluir sessão', `Remover "${sessao.titulo}"? O histórico de peladas dela continua salvo.`, async () => {
      await deleteDoc(doc(db, 'sessoes', sessaoId));
      navigation.goBack();
    });
  }

  if (!sessao || carregando) {
    return (
      <Screen edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.ocean} />
        </View>
      </Screen>
    );
  }

  const quando = sessao.recorrente
    ? `Toda ${DIA_LABEL[sessao.diaSemana]}${sessao.horario ? `, ${sessao.horario}` : ''}`
    : [sessao.data, sessao.horario].filter(Boolean).join(', ') || 'Data a combinar';

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.quando}>{quando}</Text>
        {!!sessao.local && (
          <View style={styles.localRow}>
            <Feather name="map-pin" size={13} color={colors.inkSoft} />
            <Text style={styles.local}>{sessao.local}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Quem confirmou?</Text>
        <View style={styles.gridJogadores}>
          {jogadores.map((item, index) => {
            const ativo = !!presentes[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.jogadorCard, ativo && styles.jogadorCardAtiva]}
                onPress={() => alternarPresenca(item.id)}
              >
                <View style={[styles.avatar, { backgroundColor: index % 2 === 0 ? colors.navy : colors.ocean }]}>
                  <Text style={styles.avatarText}>{iniciais(item.nome)}</Text>
                </View>
                <Text style={styles.jogadorNome} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Feather
                  name={ativo ? 'check-square' : 'square'}
                  size={16}
                  color={ativo ? colors.ocean : colors.inkSoft}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.acoesRow}>
          <TouchableOpacity style={styles.buttonSecundario} onPress={salvarPresenca} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator color={colors.ocean} />
            ) : (
              <Text style={styles.buttonSecundarioText}>Salvar presença</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimario} onPress={irParaSorteio}>
            <Text style={styles.buttonPrimarioText}>🔀 Sortear times</Text>
          </TouchableOpacity>
        </View>

        {peladasDaSessao.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Peladas anteriores desta sessão</Text>
            {peladasDaSessao.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.peladaCard}
                onPress={() => navigation.navigate('PeladaDetalhe', { pelada: p })}
              >
                <Text style={styles.peladaTexto}>{formatarData(p.createdAt)} — {p.numTimes} times</Text>
                <Feather name="chevron-right" size={16} color={colors.inkSoft} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.linkArquivar} onPress={alternarArquivar}>
          <Text style={styles.linkArquivarText}>{sessao.ativa ? 'Arquivar sessão' : 'Reativar sessão'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkExcluir} onPress={excluirSessao}>
          <Text style={styles.linkExcluirText}>Excluir sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  quando: { fontSize: 18, fontWeight: '700', color: colors.navy },
  localRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 8 },
  local: { fontSize: 13, color: colors.inkSoft },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 20, marginBottom: 10 },
  gridJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  jogadorCard: {
    flexGrow: 1,
    flexBasis: 140,
    maxWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  jogadorCardAtiva: { borderColor: colors.ocean, ...cardShadow },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 11 },
  jogadorNome: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
  acoesRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  buttonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonSecundarioText: { color: colors.ocean, fontWeight: '700' },
  buttonPrimario: { flex: 1, backgroundColor: colors.ocean, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  buttonPrimarioText: { color: colors.white, fontWeight: '700' },
  peladaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...cardShadow,
  },
  peladaTexto: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  linkArquivar: { marginTop: 24, alignItems: 'center' },
  linkArquivarText: { color: colors.inkSoft, fontWeight: '600', fontSize: 13 },
  linkExcluir: { marginTop: 12, alignItems: 'center' },
  linkExcluirText: { color: colors.coral, fontWeight: '600', fontSize: 13 },
});
