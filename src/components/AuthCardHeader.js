import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import VolleyballLogo from './VolleyballLogo';

export default function AuthCardHeader({ subtitle }) {
  return (
    <>
      <VolleyballLogo size={72} />
      <Text style={styles.brand}>
        <Text style={styles.brandDark}>Volei</Text>
        <Text style={styles.brandLight}>Team</Text>
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  brand: { marginTop: 14, fontSize: 30, fontWeight: '800' },
  brandDark: { color: colors.navy },
  brandLight: { color: colors.ocean },
  subtitle: { color: colors.navy, fontSize: 15, marginTop: 4, marginBottom: 24 },
});
