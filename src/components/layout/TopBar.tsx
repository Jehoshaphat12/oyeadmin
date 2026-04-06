import type { Page } from "../../types";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  incoming: "Incoming Rides",
  recent: "Recent Rides",
  history: "Ride History",
  drivers: "Drivers",
  passengers: "Passengers",
};

interface TopBarProps {
  currentPage: Page;
  onMenuClick: () => void;
}

export function TopBar({ currentPage, onMenuClick }: TopBarProps) {
  return (
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
          {pageTitles[currentPage]}
        </span>
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
          🔔
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
}