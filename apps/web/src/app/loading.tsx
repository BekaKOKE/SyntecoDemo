/**
 * Route-level loading UI for the storefront.
 * Shown during server data-fetch / navigation between segments.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Загрузка"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}
    >
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
