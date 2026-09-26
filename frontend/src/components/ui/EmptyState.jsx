export default function EmptyState({ title = "Nothing here yet", text = "Add your first record to get started." }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">₹</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
