// src/utils/formatDuration.js
export function formatDuration(obj) {
  if (!obj) return "0m";
  try {
    const parts = [];
    if (obj.hours) parts.push(`${obj.hours}h`);
    if (obj.minutes) parts.push(`${obj.minutes}m`);
    if (!obj.hours && !obj.minutes && obj.seconds) {
      parts.push(`${obj.seconds}s`);
    }
    return parts.join(" ") || "0m";
  } catch {
    return "0m";
  }
}
