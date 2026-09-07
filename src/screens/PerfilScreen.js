import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme';
import Screen from '../components/Screen';

export default function PerfilScreen() {
  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>👤 Meu perfil</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  email: { color: colors.inkSoft, marginBottom: 24 },
  logoutButton: { backgroundColor: colors.coral, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 999 },
  logoutText: { color: colors.white, fontWeight: '700' },
});
