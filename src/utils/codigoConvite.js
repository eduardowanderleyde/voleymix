// Sem O/0 e I/1 — letras/números fáceis de confundir num código lido em
// voz alta ou digitado rápido no celular.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function gerarCodigoConvite() {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}
