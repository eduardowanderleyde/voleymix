import { StyleSheet } from 'react-native';
import { colors, cardShadow } from '../theme';

export const authStyles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    ...cardShadow,
  },
  erro: { color: colors.coral, marginBottom: 12, textAlign: 'center' },
  sucesso: { color: colors.success, marginBottom: 12, textAlign: 'center' },
  button: {
    width: '100%',
    backgroundColor: colors.ocean,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
