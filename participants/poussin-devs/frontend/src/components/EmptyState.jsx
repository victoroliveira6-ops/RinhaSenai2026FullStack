// EmptyState: placeholder visual quando não há itens na listagem.
// Props: message (string)
export default function EmptyState({ message = 'Nenhum resultado encontrado.' }) {
  return <div className="empty-state">{message}</div>
}
