import { COLORS } from "../Utils/colors";

export default function EmptyState({ icon, title, description }) {
  return (
    <div
      style={{
        padding: 60,
        textAlign: "center",
        color: COLORS.gray[500],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 300 }}>
        {description}
      </div>
    </div>
  );
}
