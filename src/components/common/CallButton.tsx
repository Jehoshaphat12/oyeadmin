import React from "react";
import { FaPhone } from "react-icons/fa";

interface CallButtonProps {
  phone: string;
}

export const CallButton: React.FC<CallButtonProps> = ({ phone }) => (
  <a
    href={`tel:${phone}`}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: "#10B981",
      color: "#fff",
      border: "none",
      borderRadius: 7,
      padding: "6px 12px",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    <FaPhone size={10} /> Call
  </a>
);