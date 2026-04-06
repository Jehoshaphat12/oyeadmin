import React from "react";

interface StarsProps {
  value: number;
}

export const Stars: React.FC<StarsProps> = ({ value }) => (
  <span style={{ color: "#F59E0B", fontSize: 12 }}>
    {"★".repeat(Math.floor(value))}
    {"☆".repeat(5 - Math.floor(value))}{" "}
    <span style={{ color: "#6B7280" }}>{value.toFixed(1)}</span>
  </span>
);