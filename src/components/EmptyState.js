import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, cardShadow } from '../theme';

export default function EmptyState({ icon, title, description, buttonLabel, buttonIcon = 'plus', onPress, children }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={40} color={colors.ocean} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.desc}>{description}</Text>}
        {!!buttonLabel && (
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Feather name={buttonIcon} size={16} color={colors.white} />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 44,
    paddingHorizontal: 32,
    ...cardShadow,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.oceanTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 19, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  desc: {
    color: colors.inkSoft,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 360,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
