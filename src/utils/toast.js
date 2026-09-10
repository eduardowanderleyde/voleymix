let listener = null;

export function registrarToastListener(fn) {
  listener = fn;
}

export function mostrarToast(mensagem) {
  listener?.(mensagem);
}
