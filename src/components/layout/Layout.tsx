import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Page } from "../../types";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageTitles: Record<Page, string> = {
    dashboard: "Dashboard",
    incoming: "Incoming Rides",
    recent: "Recent Rides",
    history: "Ride History",
    drivers: "Drivers",
    passengers: "Passengers",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 190,
          }}
        />
      )}

      <Sidebar currentPage={currentPage} onNavigate={onNavigate} isOpen={sidebarOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 0 }}>
        <Header title={pageTitles[currentPage]} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
};