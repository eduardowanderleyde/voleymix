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
  const ordenados = [...jogadores].sort((a, b) => b.nivelMedio - a.nivelMedio);
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
    somaNiveis[alvo] += jogador.nivelMedio;
  });

  return times;
}

export function sortearTimes(jogadores, numTimes, modo) {
  if (modo === 'balanceado') {
    return sortearBalanceado(jogadores, numTimes);
  }
  return sortearAleatorio(jogadores, numTimes);
}

function somaNivel(time) {
  return time.reduce((soma, j) => soma + (j.nivelMedio ?? 0), 0);
}

export function diferencaNivel(times) {
  const somas = times.map(somaNivel);
  return Math.max(...somas) - Math.min(...somas);
}

function assinatura(times) {
  return times
    .map((time) => time.map((j) => j.id).sort().join(','))
    .sort()
    .join('|');
}

// Gera até `quantidade` sorteios diferentes entre si (mesmos jogadores, times
// diferentes), pra deixar o organizador escolher em vez de receber só uma
// opção. Pro modo balanceado, embaralha a entrada antes de cada tentativa —
// como o algoritmo é guloso por nível, isso varia o desempate entre
// jogadores de mesmo nível sem perder o equilíbrio. Ordena do mais
// equilibrado pro menos.
export function gerarSugestoes(jogadores, numTimes, modo, quantidade = 3) {
  const vistos = new Set();
  const sugestoes = [];
  const maxTentativas = quantidade * 8;

  for (let tentativa = 0; tentativa < maxTentativas && sugestoes.length < quantidade; tentativa++) {
    const entrada = modo === 'balanceado' ? embaralhar(jogadores) : jogadores;
    const times = sortearTimes(entrada, numTimes, modo);
    const chave = assinatura(times);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    sugestoes.push({ times, diferenca: diferencaNivel(times) });
  }

  if (modo === 'balanceado') {
    sugestoes.sort((a, b) => a.diferenca - b.diferenca);
  }

  return sugestoes;
}

export const FORMACAO_IDEAL = { levantador: 1, oposto: 1, ponteiro: 2, central: 2 };

function contarPosicoes(jogadores) {
  const contagem = {};
  let curingas = 0;

  jogadores.forEach((jogador) => {
    if (jogador.posicao === 'qualquer') {
      curingas += 1;
    } else if (jogador.posicao in FORMACAO_IDEAL) {
      contagem[jogador.posicao] = (contagem[jogador.posicao] || 0) + 1;
    }
  });

  return { contagem, curingas };
}

function calcularFaltas(contagem, curingas, idealPorPosicao) {
  const faltas = Object.entries(idealPorPosicao)
    .map(([posicao, ideal]) => ({ posicao, falta: ideal - (contagem[posicao] || 0) }))
    .filter(({ falta }) => falta > 0);

  let curingasRestantes = curingas;
  return faltas
    .map(({ posicao, falta }) => {
      const cobertoPorCuringa = Math.min(falta, curingasRestantes);
      curingasRestantes -= cobertoPorCuringa;
      return { posicao, falta: falta - cobertoPorCuringa };
    })
    .filter(({ falta }) => falta > 0);
}

export function posicoesFaltando(time) {
  const { contagem, curingas } = contarPosicoes(time);
  return calcularFaltas(contagem, curingas, FORMACAO_IDEAL);
}

// Mesma lógica de posicoesFaltando, mas olhando pro conjunto inteiro de
// presentes e multiplicando a formação ideal pela quantidade de times —
// serve pra avisar antes de sortear se dá pra fechar todo mundo completo.
export function faltasGlobais(jogadores, numTimes) {
  const { contagem, curingas } = contarPosicoes(jogadores);
  const idealTotal = Object.fromEntries(
    Object.entries(FORMACAO_IDEAL).map(([posicao, ideal]) => [posicao, ideal * numTimes])
  );
  return calcularFaltas(contagem, curingas, idealTotal);
}
