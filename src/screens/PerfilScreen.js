import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import VolleyballLogo from '../components/VolleyballLogo';
import { useAuthUser } from '../hooks/useAuthUser';
import { useMeuPerfil } from '../hooks/useMeuPerfil';
import { useMinhaColecao } from '../hooks/useMinhaColecao';
import { mostrarAlerta, confirmarAcao } from '../utils/alerta';
import { mostrarToast } from '../utils/toast';
import { compartilharTexto } from '../utils/compartilhar';
import { gerarCodigoConvite } from '../utils/codigoConvite';

const STATUS_LABEL = {
  pendente: 'Aguardando aprovação do organizador',
  aprovada: 'Pedido aprovado — você já faz parte!',
  recusada: 'Pedido recusado.',
};

export default function PerfilScreen() {
  const user = useAuthUser();
  const perfil = useMeuPerfil();
  const nome = perfil?.nome || user?.displayName;
  const { dados: jogadores } = useMinhaColecao('jogadores');
  const { dados: peladas } = useMinhaColecao('peladas');

  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [codigoInput, setCodigoInput] = useState('');
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [minhaSolicitacao, setMinhaSolicitacao] = useState(null);
  const [solicitacoesRecebidas, setSolicitacoesRecebidas] = useState([]);
  const [processando, setProcessando] = useState(null);

  // Gera o código de convite uma vez só, na primeira vez que o perfil carrega sem um.
  useEffect(() => {
    if (!user || !perfil || perfil.codigoConvite) return;
    setDoc(doc(db, 'users', user.uid), { codigoConvite: gerarCodigoConvite() }, { merge: true }).catch(() => {});
  }, [user, perfil]);

  // O pedido mais recente que EU enviei (pra mostrar meu próprio status).
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'solicitacoes'), where('userId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      setMinhaSolicitacao(lista[0] ?? null);
    });
  }, [user]);

  // Pedidos pendentes que outras pessoas me enviaram (eu como organizador).
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'solicitacoes'), where('ownerId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.status === 'pendente')
        .sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
      setSolicitacoesRecebidas(lista);
    });
  }, [user]);

  function iniciarEdicao() {
    setNomeEditado(nome || '');
    setEditando(true);
  }

  async function salvarNome() {
    if (!nomeEditado.trim()) {
      mostrarAlerta('Digite um nome válido.');
      return;
    }
    setSalvando(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { nome: nomeEditado.trim() }, { merge: true });
      setEditando(false);
    } catch (e) {
      mostrarAlerta('Não deu pra salvar o nome.', e.message);
    } finally {
      setSalvando(false);
    }
  }

  function handleCompartilharCodigo() {
    if (!perfil?.codigoConvite) return;
    compartilharTexto(
      `Entra na minha pelada no VoleiTeam! Baixa o app e usa o código de convite: ${perfil.codigoConvite}`
    );
  }

  async function handleEnviarPedido() {
    const codigo = codigoInput.trim().toUpperCase();
    if (!codigo) {
      mostrarAlerta('Digite o código de convite.');
      return;
    }
    setEnviandoPedido(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('codigoConvite', '==', codigo)));
      if (snap.empty) {
        mostrarAlerta('Código não encontrado.', 'Confira com quem te convidou se digitou certo.');
        return;
      }
      const organizador = snap.docs[0];
      if (organizador.id === user.uid) {
        mostrarAlerta('Esse é o seu próprio código de convite.');
        return;
      }
      await addDoc(collection(db, 'solicitacoes'), {
        codigoConvite: codigo,
        ownerId: organizador.id,
        userId: user.uid,
        nome: nome || user.email,
        email: user.email,
        status: 'pendente',
        createdAt: serverTimestamp(),
      });
      setCodigoInput('');
      mostrarToast('Pedido enviado! Aguarde a aprovação.');
    } catch (e) {
      mostrarAlerta('Não deu pra enviar o pedido.', e.message);
    } finally {
      setEnviandoPedido(false);
    }
  }

  async function handleAprovar(solicitacao) {
    setProcessando(solicitacao.id);
    try {
      await setDoc(doc(db, 'jogadores', solicitacao.userId), {
        ownerId: solicitacao.ownerId,
        nome: solicitacao.nome,
        posicao: 'qualquer',
        saque: 3,
        recepcao: 3,
        levantamento: 3,
        ataque: 3,
        bloqueio: 3,
        defesa: 3,
        nivelMedio: 3,
        vinculado: true,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'solicitacoes', solicitacao.id), { status: 'aprovada' });
      mostrarToast(`${solicitacao.nome} agora faz parte da sua pelada!`);
    } catch (e) {
      mostrarAlerta('Não deu pra aprovar.', e.message);
    } finally {
      setProcessando(null);
    }
  }

  function handleRecusar(solicitacao) {
    confirmarAcao('Recusar pedido', `Recusar a entrada de ${solicitacao.nome}?`, async () => {
      setProcessando(solicitacao.id);
      try {
        await updateDoc(doc(db, 'solicitacoes', solicitacao.id), { status: 'recusada' });
      } catch (e) {
        mostrarAlerta('Não deu pra recusar.', e.message);
      } finally {
        setProcessando(null);
      }
    });
  }

  return (
    <Screen edges={['bottom']} style={styles.center}>
      <View style={styles.card}>
        <VolleyballLogo size={64} />

        {editando ? (
          <View style={styles.edicaoRow}>
            <TextInput
              style={styles.input}
              value={nomeEditado}
              onChangeText={setNomeEditado}
              placeholder="Seu nome"
              placeholderTextColor={colors.inkSoft}
              autoFocus
            />
            <TouchableOpacity onPress={salvarNome} disabled={salvando} hitSlop={8}>
              {salvando ? (
                <ActivityIndicator size="small" color={colors.ocean} />
              ) : (
                <Feather name="check" size={20} color={colors.ocean} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditando(false)} hitSlop={8}>
              <Feather name="x" size={20} color={colors.inkSoft} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.tituloRow} onPress={iniciarEdicao}>
            <Text style={styles.title}>{nome || 'Meu perfil'}</Text>
            <Feather name="edit-2" size={14} color={colors.inkSoft} />
          </TouchableOpacity>
        )}

        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumero}>{jogadores.length}</Text>
            <Text style={styles.statLabel}>jogadores</Text>
          </View>
          <View style={styles.statDivisor} />
          <View style={styles.statCard}>
            <Text style={styles.statNumero}>{peladas.length}</Text>
            <Text style={styles.statLabel}>peladas</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Meu código de convite</Text>
          <View style={styles.codigoBox}>
            <Text style={styles.codigoTexto}>{perfil?.codigoConvite || '······'}</Text>
            <TouchableOpacity onPress={handleCompartilharCodigo} hitSlop={8} disabled={!perfil?.codigoConvite}>
              <Feather name="share-2" size={16} color={colors.ocean} />
            </TouchableOpacity>
          </View>
          <Text style={styles.secaoDica}>
            Compartilhe com quem vai jogar — a pessoa cria conta e pede pra entrar com esse código.
          </Text>
        </View>

        {solicitacoesRecebidas.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>
              Pedidos pra entrar ({solicitacoesRecebidas.length})
            </Text>
            {solicitacoesRecebidas.map((s) => (
              <View key={s.id} style={styles.pedidoLinha}>
                <Text style={styles.pedidoNome} numberOfLines={1}>
                  {s.nome}
                </Text>
                {processando === s.id ? (
                  <ActivityIndicator size="small" color={colors.ocean} />
                ) : (
                  <View style={styles.pedidoAcoes}>
                    <TouchableOpacity onPress={() => handleAprovar(s)} hitSlop={8}>
                      <Feather name="check-circle" size={20} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRecusar(s)} hitSlop={8}>
                      <Feather name="x-circle" size={20} color={colors.coral} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Entrar numa pelada</Text>
          {minhaSolicitacao && minhaSolicitacao.status !== 'recusada' ? (
            <View style={styles.statusBox}>
              <Feather
                name={minhaSolicitacao.status === 'aprovada' ? 'check-circle' : 'clock'}
                size={14}
                color={minhaSolicitacao.status === 'aprovada' ? colors.success : colors.inkSoft}
              />
              <Text style={styles.statusTexto}>{STATUS_LABEL[minhaSolicitacao.status]}</Text>
            </View>
          ) : (
            <View style={styles.codigoInputRow}>
              <TextInput
                style={styles.codigoInput}
                value={codigoInput}
                onChangeText={(v) => setCodigoInput(v.toUpperCase())}
                placeholder="Código de convite"
                placeholderTextColor={colors.inkSoft}
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity style={styles.enviarButton} onPress={handleEnviarPedido} disabled={enviandoPedido}>
                {enviandoPedido ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.enviarButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
          <Feather name="log-out" size={16} color={colors.white} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    ...cardShadow,
  },
  tituloRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  title: { fontSize: 20, fontWeight: '700', color: colors.navy },
  edicaoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, width: '100%' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.ink,
    fontSize: 15,
  },
  email: { color: colors.inkSoft, marginTop: 4, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.oceanTint,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivisor: { width: 1, height: 30, backgroundColor: colors.border },
  statNumero: { fontSize: 20, fontWeight: '800', color: colors.navy },
  statLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
  secao: { width: '100%', marginBottom: 20 },
  secaoTitulo: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  secaoDica: { fontSize: 11, color: colors.inkSoft, marginTop: 6, lineHeight: 16 },
  codigoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.sand,
  },
  codigoTexto: { fontSize: 18, fontWeight: '800', color: colors.navy, letterSpacing: 3 },
  pedidoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pedidoNome: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink },
  pedidoAcoes: { flexDirection: 'row', gap: 12 },
  codigoInputRow: { flexDirection: 'row', gap: 8 },
  codigoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontWeight: '700',
    letterSpacing: 2,
  },
  enviarButton: {
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.sand,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusTexto: { fontSize: 12, color: colors.inkSoft, fontWeight: '600', flexShrink: 1 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.coral,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  logoutText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
