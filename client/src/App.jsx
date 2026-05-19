import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import SpacesPage from './pages/SpacesPage.jsx';
import SpaceDetailPage from './pages/SpaceDetailPage.jsx';
import BookSpacePage from './pages/BookSpacePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminBranchesPage from './pages/admin/AdminBranchesPage.jsx';
import AdminSpacesPage from './pages/admin/AdminSpacesPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';
import AdminCustomersPage from './pages/admin/AdminCustomersPage.jsx';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage.jsx';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage.jsx';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage.jsx';
import AdminNocPage from './pages/admin/AdminNocPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || !['SUPER_ADMIN', 'BRANCH_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="spaces" element={<SpacesPage />} />
              <Route path="spaces/:spaceId" element={<SpaceDetailPage />} />
              <Route path="book/:spaceId" element={<ProtectedRoute><BookSpacePage /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="branches" element={<AdminBranchesPage />} />
              <Route path="spaces" element={<AdminSpacesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="noc" element={<AdminNocPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
