import { Alert, Platform } from 'react-native';

// Alert.alert do react-native-web não exibe nada (é um no-op), então no web
// usamos window.alert/confirm pra garantir que o usuário veja a mensagem.
export function mostrarAlerta(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

export function confirmarAcao(titulo, mensagem, onConfirmar) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensagem ? `${titulo}\n\n${mensagem}` : titulo)) {
      onConfirmar();
    }
  } else {
    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: onConfirmar },
    ]);
  }
}
