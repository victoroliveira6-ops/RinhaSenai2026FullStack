export default function StatusPill({ status, className = '', ...props }) {
  const classes = ['status-pill', `status-${status}`, className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...props}>
      {status}
    </span>
  )
}
