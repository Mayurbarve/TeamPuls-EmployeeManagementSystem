export default function Badge({ children, color, small = false }) {
  return (
    <span
      style={{
        background: `${color}15`,
        color,
        padding: small ? "2px 8px" : "4px 10px",
        borderRadius: 999,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}
