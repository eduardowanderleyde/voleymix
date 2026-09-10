import { Platform, Share } from 'react-native';
import { mostrarAlerta } from './alerta';

export function montarTextoTimes(times, { modo, data } = {}) {
  const modoLabel = modo === 'balanceado' ? '⚖️ Balanceado' : modo === 'aleatorio' ? '🎲 Aleatório' : '';
  const linhas = [`🏐 Times${data ? ` — ${data}` : ''}`];
  if (modoLabel) linhas.push(modoLabel);
  linhas.push('');
  times.forEach((time, i) => {
    linhas.push(`Time ${i + 1}:`);
    time.jogadores.forEach((j) => linhas.push(`• ${j.nome}`));
    linhas.push('');
  });
  linhas.push('Sorteado no VoleiTeam 🏐');
  return linhas.join('\n').trim();
}

export async function compartilharTexto(texto) {
  if (Platform.OS !== 'web') {
    try {
      await Share.share({ message: texto });
    } catch (e) {
      // usuário cancelou o compartilhamento, sem problema
    }
    return;
  }

  // Web: nem todo navegador tem a Web Share API (ex: desktop) — nesse caso
  // copia pra área de transferência, que resolve igual bem pra colar no
  // grupo do WhatsApp.
  try {
    await Share.share({ message: texto });
  } catch (e) {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarAlerta('Copiado!', 'Cola no grupo do WhatsApp (ou onde quiser).');
    } catch (e2) {
      mostrarAlerta('Não deu pra compartilhar nem copiar.', 'Tenta selecionar o texto manualmente.');
    }
  }
}

export async function compartilharTimes(times, opcoes) {
  await compartilharTexto(montarTextoTimes(times, opcoes));
}
