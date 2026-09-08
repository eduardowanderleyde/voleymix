import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export default function AuthFooter({ prompt, actionLabel, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{prompt} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  text: { color: colors.ink },
  link: { color: colors.ocean, fontWeight: '700' },
});
