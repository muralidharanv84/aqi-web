import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";
import { DEFAULT_DEVICE_ID } from "../domain/devices";
import AboutPage from "../pages/AboutPage";
import ChartsPage from "../pages/ChartsPage";
import ComparePage from "../pages/ComparePage";
import DashboardPage from "../pages/DashboardPage";

export function Routes() {
  return (
    <RouterRoutes>
      <Route
        path="/"
        element={<Navigate to={`/${DEFAULT_DEVICE_ID}/`} replace />}
      />
      <Route path="/:deviceId/" element={<DashboardPage />} />
      <Route path="/:deviceId/charts" element={<ChartsPage />} />
      <Route path="/compare" element={<Navigate to={`/${DEFAULT_DEVICE_ID}/compare`} replace />} />
      <Route path="/:deviceId/compare" element={<ComparePage />} />
      <Route path="/:deviceId/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}
