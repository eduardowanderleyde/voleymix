import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import Feather from '@expo/vector-icons/Feather';
import { auth } from '../config/firebase';
import { colors, cardShadow } from '../theme';
import Screen from '../components/Screen';
import VolleyballLogo from '../components/VolleyballLogo';
import { useAuthUser } from '../hooks/useAuthUser';
import { useMeuPerfil } from '../hooks/useMeuPerfil';

export default function PerfilScreen() {
  const user = useAuthUser();
  const perfil = useMeuPerfil();
  const nome = perfil?.nome || user?.displayName;

  return (
    <Screen edges={['bottom']} style={styles.center}>
      <View style={styles.card}>
        <VolleyballLogo size={64} />
        <Text style={styles.title}>{nome || 'Meu perfil'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

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
  title: { fontSize: 20, fontWeight: '700', color: colors.navy, marginTop: 14 },
  email: { color: colors.inkSoft, marginTop: 4, marginBottom: 24 },
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
