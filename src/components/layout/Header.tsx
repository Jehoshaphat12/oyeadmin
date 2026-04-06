import React from "react";
import { FaBars, FaBell } from "react-icons/fa";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => (
  <div
    style={{
      background: "#fff",
      borderBottom: "1px solid #E5E7EB",
      padding: "0 20px",
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          borderRadius: 7,
          color: "#6B7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaBars size={18} />
      </button>
      <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          color: "#6B7280",
          background: "#F3F4F6",
          borderRadius: 20,
          padding: "4px 10px",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10B981",
            display: "inline-block",
          }}
        />
        Live
      </div>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          cursor: "pointer",
          position: "relative",
        }}
      >
        <FaBell size={16} color="#6B7280" />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#EF4444",
            border: "2px solid #fff",
          }}
        />
      </div>
    </div>
  </div>
);