import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/murali-1/" replace />} />
      <Route path="/:deviceId/" element={<DashboardPage />} />
    </RouterRoutes>
  );
}
