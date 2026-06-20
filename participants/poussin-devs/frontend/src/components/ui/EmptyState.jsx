export default function EmptyState({ message = 'Nenhum resultado encontrado.' }) {
  return (
    <div className="empty-state" role="status">
      {message}
    </div>
  )
}
