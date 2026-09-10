import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, cardShadow } from '../theme';
import { registrarToastListener } from '../utils/toast';

export default function ToastHost() {
  const [mensagem, setMensagem] = useState(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    registrarToastListener((msg) => {
      setMensagem(msg);
      Animated.timing(opacidade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        Animated.timing(opacidade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
          setMensagem(null)
        );
      }, 3000);
    });
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      registrarToastListener(null);
    };
  }, [opacidade]);

  if (!mensagem) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: opacidade }]} pointerEvents="none">
      <Feather name="check-circle" size={16} color={colors.white} />
      <Text style={styles.texto}>{mensagem}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 16,
    right: 16,
    left: 16,
    maxWidth: 360,
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 999,
    ...cardShadow,
  },
  texto: { color: colors.white, fontWeight: '700', fontSize: 13, flexShrink: 1 },
});
