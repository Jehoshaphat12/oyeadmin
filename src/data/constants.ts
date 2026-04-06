import type { VehicleType } from "../types";

export const vehicleIcon: Record<VehicleType, string> = {
  motor: "🏍",
  delivery: "📦",
  bicycle_delivery: "🚲",
};

export const vehicleLabel: Record<VehicleType, string> = {
  motor: "Motor",
  delivery: "Delivery",
  bicycle_delivery: "Bicycle",
};

export const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  requesting: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  accepted: { bg: "#DBEAFE", text: "#1E3A5F", dot: "#3B82F6" },
  in_progress: { bg: "#DBEAFE", text: "#1E3A5F", dot: "#3B82F6" },
  completed: { bg: "#D1FAE5", text: "#064E3B", dot: "#10B981" },
  cancelled: { bg: "#FEE2E2", text: "#7F1D1D", dot: "#EF4444" },
};

export const avatarColors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"];

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const weekRides = [14, 21, 18, 25, 30, 42, 19];
export const weekRevenue = [280, 410, 355, 490, 600, 820, 380];