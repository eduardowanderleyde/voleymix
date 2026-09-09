import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import VolleyballLogo from '../components/VolleyballLogo';
import { useAuthUser } from '../hooks/useAuthUser';
import { useMeuPerfil } from '../hooks/useMeuPerfil';
import { useMinhaColecao } from '../hooks/useMinhaColecao';
import { mostrarAlerta } from '../utils/alerta';

export default function PerfilScreen() {
  const user = useAuthUser();
  const perfil = useMeuPerfil();
  const nome = perfil?.nome || user?.displayName;
  const { dados: jogadores } = useMinhaColecao('jogadores');
  const { dados: peladas } = useMinhaColecao('peladas');

  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [salvando, setSalvando] = useState(false);

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
    maxWidth: 360,
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
    marginBottom: 24,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivisor: { width: 1, height: 30, backgroundColor: colors.border },
  statNumero: { fontSize: 20, fontWeight: '800', color: colors.navy },
  statLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
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
