function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function criarTimesVazios(numTimes) {
  return Array.from({ length: numTimes }, () => []);
}

export function sortearAleatorio(jogadores, numTimes) {
  const embaralhados = embaralhar(jogadores);
  const times = criarTimesVazios(numTimes);
  embaralhados.forEach((jogador, i) => {
    times[i % numTimes].push(jogador);
  });
  return times;
}

export function sortearBalanceado(jogadores, numTimes) {
  const ordenados = [...jogadores].sort((a, b) => b.nivel - a.nivel);
  const times = criarTimesVazios(numTimes);
  const somaNiveis = new Array(numTimes).fill(0);

  ordenados.forEach((jogador) => {
    let alvo = 0;
    for (let i = 1; i < numTimes; i++) {
      const menorSoma = somaNiveis[i] < somaNiveis[alvo];
      const somaIgualMenosGente = somaNiveis[i] === somaNiveis[alvo] && times[i].length < times[alvo].length;
      if (menorSoma || somaIgualMenosGente) {
        alvo = i;
      }
    }
    times[alvo].push(jogador);
    somaNiveis[alvo] += jogador.nivel;
  });

  return times;
}

export function sortearTimes(jogadores, numTimes, modo) {
  if (modo === 'balanceado') {
    return sortearBalanceado(jogadores, numTimes);
  }
  return sortearAleatorio(jogadores, numTimes);
}
