import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import GoogleIcon from './GoogleIcon';

export default function GoogleSignInButton({ onPress, loading }) {
  return (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={onPress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <>
            <GoogleIcon size={18} />
            <Text style={styles.googleButtonText}>Continuar com Google</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.inkSoft, fontSize: 12, marginHorizontal: 10 },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    marginBottom: 20,
    gap: 10,
  },
  googleButtonText: { color: colors.navy, fontWeight: '700', fontSize: 15 },
});
