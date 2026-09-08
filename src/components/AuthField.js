import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../theme';

export default function AuthField({ label, icon, secure, ...inputProps }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrapper}>
        <Feather name={icon} size={18} color={colors.inkSoft} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.inkSoft}
          secureTextEntry={secure && !mostrar}
          {...inputProps}
        />
        {secure && (
          <TouchableOpacity onPress={() => setMostrar((v) => !v)} hitSlop={8}>
            <Feather name={mostrar ? 'eye-off' : 'eye'} size={18} color={colors.inkSoft} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { alignSelf: 'flex-start', color: colors.navy, fontWeight: '600', fontSize: 13, marginBottom: 6 },
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: colors.ink },
});
