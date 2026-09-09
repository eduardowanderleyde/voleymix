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

// jogador.nivelMedio pode não existir (dado antigo/incompleto) — sem esse
// fallback, a soma vira NaN e QUALQUER comparação com NaN é falsa, o que
// travava `alvo` sempre em 0 e jogava todo mundo no primeiro time.
function nivelOuPadrao(jogador) {
  return jogador.nivelMedio ?? 3;
}

// Prioridade do balanceamento, nessa ordem:
//   1. Espalhar cada posição específica entre os times (ninguém deveria
//      ficar sem levantador/central/etc. enquanto outro time acumula).
//   2. Usar os jogadores "Qualquer" pra tapar os buracos de posição que
//      sobrarem (time com maior carência recebe primeiro).
//   3. Só then usar o nível pra desempatar quem vai pra onde.
export function sortearBalanceado(jogadores, numTimes) {
  const times = criarTimesVazios(numTimes);
  const contagemPosicao = Array.from({ length: numTimes }, () => ({}));
  const somaNiveis = new Array(numTimes).fill(0);

  function melhorTimePara(posicao) {
    let alvo = 0;
    for (let i = 1; i < numTimes; i++) {
      const contAtual = contagemPosicao[i][posicao] || 0;
      const contAlvo = contagemPosicao[alvo][posicao] || 0;
      const menosDessaPosicao = contAtual < contAlvo;
      const empatePosicaoMenorNivel = contAtual === contAlvo && somaNiveis[i] < somaNiveis[alvo];
      const empateTudoMenosGente =
        contAtual === contAlvo && somaNiveis[i] === somaNiveis[alvo] && times[i].length < times[alvo].length;
      if (menosDessaPosicao || empatePosicaoMenorNivel || empateTudoMenosGente) {
        alvo = i;
      }
    }
    return alvo;
  }

  function atribuir(jogador, time) {
    times[time].push(jogador);
    contagemPosicao[time][jogador.posicao] = (contagemPosicao[time][jogador.posicao] || 0) + 1;
    somaNiveis[time] += nivelOuPadrao(jogador);
  }

  const porPosicao = {};
  const curingas = [];
  jogadores.forEach((jogador) => {
    if (jogador.posicao === 'qualquer') {
      curingas.push(jogador);
    } else {
      porPosicao[jogador.posicao] = porPosicao[jogador.posicao] || [];
      porPosicao[jogador.posicao].push(jogador);
    }
  });

  Object.values(porPosicao).forEach((lista) => {
    lista.sort((a, b) => nivelOuPadrao(b) - nivelOuPadrao(a));
    lista.forEach((jogador) => atribuir(jogador, melhorTimePara(jogador.posicao)));
  });

  curingas.sort((a, b) => nivelOuPadrao(b) - nivelOuPadrao(a));
  curingas.forEach((curinga) => {
    let alvo = 0;
    let maiorCarencia = -1;
    for (let i = 0; i < numTimes; i++) {
      const carencia = Object.entries(FORMACAO_IDEAL).reduce(
        (soma, [posicao, ideal]) => soma + Math.max(0, ideal - (contagemPosicao[i][posicao] || 0)),
        0
      );
      const maisCarente = carencia > maiorCarencia;
      const empateMenorNivel = carencia === maiorCarencia && somaNiveis[i] < somaNiveis[alvo];
      if (maisCarente || empateMenorNivel) {
        maiorCarencia = carencia;
        alvo = i;
      }
    }
    atribuir(curinga, alvo);
  });

  return times;
}

export function sortearTimes(jogadores, numTimes, modo) {
  if (modo === 'balanceado') {
    return sortearBalanceado(jogadores, numTimes);
  }
  return sortearAleatorio(jogadores, numTimes);
}

function mediaNivel(time) {
  if (!time.length) return 0;
  return time.reduce((soma, j) => soma + nivelOuPadrao(j), 0) / time.length;
}

// Diferença entre a média de nível do time mais forte e do mais fraco — o
// mesmo número que "média X,X" mostra por time, pra bater com o que a tela
// exibe (antes comparava a SOMA dos times, que não tem o mesmo significado
// quando os times têm o mesmo tamanho mas a UI já fala em média).
export function diferencaNivel(times) {
  const medias = times.map(mediaNivel);
  return Math.max(...medias) - Math.min(...medias);
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
