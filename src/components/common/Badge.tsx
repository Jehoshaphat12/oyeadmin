import React from "react";
import { statusColor } from "../../utils/helpers";

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const c = statusColor[status] || statusColor.completed;
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        borderRadius: 20,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {status.replace("_", " ")}
    </span>
  );
};