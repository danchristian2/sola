import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { PartnerPage } from "./pages/public/PartnerPage";
import { AcceptInvitePage } from "./pages/public/AcceptInvitePage";
import { SeekerRequestsPage } from "./pages/service-seeker/SeekerRequestsPage";
import { NewRequestPage } from "./pages/service-seeker/NewRequestPage";
import { SeekerRequestDetailPage } from "./pages/service-seeker/SeekerRequestDetailPage";
import { CoordinatorInboxPage, CoordinatorReviewPage } from "./pages/coordinator/RequestInboxPage";
import {
  AdminDashboardPage,
  PortfolioPage,
  TeacherDashboardPage
} from "./pages/app/Dashboards";
import { ProjectPage } from "./pages/app/ProjectPage";
import { SchoolHomePage } from "./pages/school/SchoolHomePage";
import { DepartmentsPage } from "./pages/school/DepartmentsPage";
import { PeoplePage } from "./pages/school/PeoplePage";
import { SchoolSettingsPage } from "./pages/school/SchoolSettingsPage";
import { RequireAuth } from "./routes/RequireAuth";
import { useAuth } from "./features/auth/auth-context";
import { dashboardPath } from "./routes/dashboardPath";

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;
  return <LandingPage />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="/invite" element={<AcceptInvitePage />} />
      <Route
        path="/app/seeker"
        element={
          <RequireAuth roles={["SERVICE_SEEKER"]}>
            <SeekerRequestsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/seeker/new"
        element={
          <RequireAuth roles={["SERVICE_SEEKER"]}>
            <NewRequestPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/seeker/requests/:id"
        element={
          <RequireAuth roles={["SERVICE_SEEKER"]}>
            <SeekerRequestDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/school"
        element={
          <RequireAuth roles={["SCHOOL_ADMIN"]}>
            <SchoolHomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/school/portfolio"
        element={
          <RequireAuth roles={["SCHOOL_ADMIN", "SCHOOL_COORDINATOR", "TEACHER"]}>
            <PortfolioPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/school/departments"
        element={
          <RequireAuth roles={["SCHOOL_ADMIN", "SCHOOL_COORDINATOR"]}>
            <DepartmentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/school/people"
        element={
          <RequireAuth roles={["SCHOOL_ADMIN", "SCHOOL_COORDINATOR"]}>
            <PeoplePage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/school/settings"
        element={
          <RequireAuth roles={["SCHOOL_ADMIN"]}>
            <SchoolSettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/coordinator"
        element={
          <RequireAuth roles={["SCHOOL_COORDINATOR", "SCHOOL_ADMIN"]}>
            <CoordinatorInboxPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/coordinator/requests/:id"
        element={
          <RequireAuth roles={["SCHOOL_COORDINATOR", "SCHOOL_ADMIN"]}>
            <CoordinatorReviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/teacher"
        element={
          <RequireAuth roles={["TEACHER"]}>
            <TeacherDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/projects/:id"
        element={
          <RequireAuth>
            <ProjectPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/admin"
        element={
          <RequireAuth roles={["SUPER_ADMIN"]}>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
