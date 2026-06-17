// Chave regenerada somente em sucesso — mantida em erro para retry seguro sem duplicar transações.
export const newIdempotencyKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
