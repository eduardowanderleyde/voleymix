import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
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

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
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

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} hitSlop={8}>
            <Feather name="bell" size={20} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profile}
            onPress={() => navigation.navigate('Tabs', { screen: 'Perfil' })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciais(nome)}</Text>
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              {nome}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.inkSoft} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.white },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  brandTextWrap: { flexShrink: 1 },
  brandTitle: { fontSize: 17, fontWeight: '800' },
  brandDark: { color: colors.navy },
  brandLight: { color: colors.ocean },
  tagline: { fontSize: 11, color: colors.inkSoft },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconButton: { padding: 4 },
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
});
