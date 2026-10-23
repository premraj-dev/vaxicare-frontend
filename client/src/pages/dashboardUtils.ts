export function formatDashboardDate(value: string | null | undefined) {
  if (!value) return "No upcoming dose";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
