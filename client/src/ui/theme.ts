export const BLUE = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export function blueAt(index: number) {
  return BLUE[index % BLUE.length];
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "In review",
    NEEDS_INFORMATION: "Needs info",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    MATCHING: "Matching",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In progress",
    TESTING: "Testing",
    AWAITING_CLIENT_FEEDBACK: "Feedback",
    REVISION_REQUIRED: "Revision",
    READY_FOR_DELIVERY: "Ready",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  };
  return map[status] ?? status.replaceAll("_", " ");
}

export function statusClass(status: string) {
  if (status.includes("COMPLETE") || status === "DELIVERED") return "badge-done";
  if (["IN_PROGRESS", "TESTING", "ASSIGNED"].includes(status)) return "badge-live";
  if (["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "MATCHING"].includes(status)) return "badge-wait";
  return "badge-muted";
}

export function urgencyClass(urgency: string) {
  if (urgency === "URGENT" || urgency === "HIGH") return "badge-live";
  return "badge-muted";
}
