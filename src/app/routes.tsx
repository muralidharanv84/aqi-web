import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import ChartsPage from "../pages/ChartsPage";
import DashboardPage from "../pages/DashboardPage";

export function Routes() {
  return (
    <RouterRoutes>
      <Route
        path="/"
        element={<Navigate to="/murali-living-room/" replace />}
      />
      <Route path="/:deviceId/" element={<DashboardPage />} />
      <Route path="/:deviceId/charts" element={<ChartsPage />} />
      <Route path="/:deviceId/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}
