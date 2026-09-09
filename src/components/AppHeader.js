import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme';
import VolleyballLogo from './VolleyballLogo';
import { iniciais } from '../utils/iniciais';
import { useAuthUser } from '../hooks/useAuthUser';
import { useMeuPerfil } from '../hooks/useMeuPerfil';

export default function AppHeader() {
  const navigation = useNavigation();
  const user = useAuthUser();
  const perfil = useMeuPerfil();
  const nome = perfil?.nome || user?.displayName || user?.email || 'Usuário';
  const [menuAberto, setMenuAberto] = useState(false);

  function irParaPerfil() {
    setMenuAberto(false);
    navigation.navigate('Tabs', { screen: 'Perfil' });
  }

  function sair() {
    setMenuAberto(false);
    signOut(auth);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.containerInner}>
          <View style={styles.brand}>
            <VolleyballLogo size={32} />
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandTitle}>
                <Text style={styles.brandDark}>Volei</Text>
                <Text style={styles.brandLight}>Team</Text>
              </Text>
              <Text style={styles.tagline} numberOfLines={1}>
                Mais que um jogo, uma conexão.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profile} onPress={() => setMenuAberto(true)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciais(nome)}</Text>
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              {nome}
            </Text>
            <Feather name={menuAberto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.inkSoft} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuAberto(false)}>
          <View style={styles.menu}>
            <View style={styles.menuCabecalho}>
              <Text style={styles.menuNome} numberOfLines={1}>
                {nome}
              </Text>
              {!!user?.email && (
                <Text style={styles.menuEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              )}
            </View>
            <View style={styles.menuDivisor} />
            <TouchableOpacity style={styles.menuItem} onPress={irParaPerfil}>
              <Feather name="user" size={16} color={colors.ink} />
              <Text style={styles.menuItemText}>Ver perfil</Text>
            </TouchableOpacity>
            <View style={styles.menuDivisor} />
            <TouchableOpacity style={styles.menuItem} onPress={sair}>
              <Feather name="log-out" size={16} color={colors.coral} />
              <Text style={[styles.menuItemText, styles.menuItemTextPerigo]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.white },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  brandTextWrap: { flexShrink: 1 },
  brandTitle: { fontSize: 17, fontWeight: '800' },
  brandDark: { color: colors.navy },
  brandLight: { color: colors.ocean },
  tagline: { fontSize: 12, color: colors.inkSoft },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  profileName: { color: colors.ink, fontWeight: '600', fontSize: 13, maxWidth: 120 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  menu: {
    position: 'absolute',
    top: 58,
    right: 16,
    minWidth: 200,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  menuCabecalho: { paddingHorizontal: 16, paddingVertical: 10 },
  menuNome: { fontSize: 14, fontWeight: '700', color: colors.navy },
  menuEmail: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  menuItemTextPerigo: { color: colors.coral },
  menuDivisor: { height: 1, backgroundColor: colors.border, marginHorizontal: 8 },
});
