export const colors = {
  sand: '#FFF6E9',
  navy: '#16324F',
  ocean: '#2E86AB',
  sun: '#FFC145',
  coral: '#FF6B4A',
  ink: '#1B2430',
  inkSoft: '#5A6B7A',
  white: '#FFFFFF',
  success: '#2E7D5B',
  border: '#E3E8EF',
  oceanTint: '#EAF4FA',
  coralTint: '#FDEDE9',
};

export const cardShadow = {
  shadowColor: colors.navy,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3,
};

export const NIVEIS = [1, 2, 3, 4, 5];

export const POSICOES = [
  { value: 'levantador', label: 'Levantador' },
  { value: 'ponteiro', label: 'Ponteiro' },
  { value: 'oposto', label: 'Oposto' },
  { value: 'central', label: 'Central' },
  { value: 'libero', label: 'Líbero' },
  { value: 'qualquer', label: 'Qualquer' },
];

export const POSICAO_LABEL_PLURAL = {
  levantador: 'levantadores',
  ponteiro: 'ponteiros',
  oposto: 'opostos',
  central: 'centrais',
  libero: 'líberos',
  qualquer: 'curingas',
};

export const GRUPO_POSICAO = {
  levantador: 'levantadores',
  ponteiro: 'atacantes',
  oposto: 'atacantes',
  central: 'defensores',
  libero: 'defensores',
};

// As 6 habilidades fundamentais do vôlei, usadas na ficha do jogador.
export const HABILIDADES = [
  { value: 'saque', label: 'Saque' },
  { value: 'recepcao', label: 'Recepção' },
  { value: 'levantamento', label: 'Levantamento' },
  { value: 'ataque', label: 'Ataque' },
  { value: 'bloqueio', label: 'Bloqueio' },
  { value: 'defesa', label: 'Defesa' },
];

export function calcularNivelMedio(habilidades) {
  const valores = HABILIDADES.map((h) => habilidades[h.value] ?? 0);
  return Math.round(valores.reduce((soma, v) => soma + v, 0) / valores.length);
}

export function categoriaJogador(nivelMedio) {
  if (nivelMedio >= 4) {
    return { label: 'Avançado', bg: '#FFF1CC', text: '#8A6200' };
  }
  if (nivelMedio >= 3) {
    return { label: 'Intermediário', bg: '#DCEEFB', text: colors.ocean };
  }
  return { label: 'Iniciante', bg: '#ECEEF1', text: colors.inkSoft };
}
