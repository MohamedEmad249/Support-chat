import { createBrowserRouter } from "react-router";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import AuthPage from "./pages/auth-page";
import DashboardLayout from "./layouts/dashboard-layout";
import MainDashboard from "./pages/main-dashboard";
import ConversationsPage from "./pages/conversations-page";
import AgentManagementPage from "./pages/agent-management-page";
import AnalyticsPage from "./pages/analytics-page";
import SettingsPage from "./pages/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <MainDashboard /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "agents", element: <AgentManagementPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
