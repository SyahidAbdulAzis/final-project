import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/LandingPage';
import { AuthProvider } from './features/auth/stores/AuthContext.js';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.js';
import {
  LoginPage,
  RegisterPage,
  VerifyPage,
  CheckEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProfilePage,
} from './features/auth/pages/index.js';
import {
  PropertyCatalogPage,
  PropertyDetailPage,
} from './features/property/pages/index.js';
import { BookingPage, BookingHistoryPage } from './features/booking/pages/index.js';
import { PaymentPage } from './features/payment/pages/index.js';
import { TransactionPage } from './features/transaction/pages/index.js';
import { TenantTransactionPage } from './features/tenant/pages/index.js';
import { ReportPage, PropertyReportPage } from './features/report/pages/index.js';
import {
  TenantDashboardPage,
  TenantPropertiesPage,
  TenantCategoriesPage,
  TenantRoomsPage,
  TenantAvailabilityPage,
} from './features/property/tenant/pages/index.js';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/login/user" element={<LoginPage role="user" />} />
          <Route path="/login/tenant" element={<LoginPage role="tenant" />} />

          <Route path="/register" element={<Navigate to="/register/user" replace />} />
          <Route path="/register/user" element={<RegisterPage role="user" />} />
          <Route path="/register/tenant" element={<RegisterPage role="tenant" />} />

          <Route path="/verify-email" element={<VerifyPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/:role" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Property Management */}
          <Route path="/properties" element={<PropertyCatalogPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />

          {/* Booking */}
          <Route path="/booking/:roomId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/transactions" element={<TransactionPage />} />
          <Route path="/booking-history" element={<BookingHistoryPage />} />

          {/* Tenant Transaction Management */}
          <Route path="/tenant/transactions" element={<TenantTransactionPage />} />

          {/* Tenant Reports */}
          <Route path="/tenant/reports" element={<ReportPage />} />
          <Route path="/tenant/reports/property" element={<PropertyReportPage />} />

          {/* Tenant Dashboard */}
          <Route path="/tenant/dashboard" element={<ProtectedRoute role="tenant"><TenantDashboardPage /></ProtectedRoute>} />
          <Route path="/tenant/properties" element={<ProtectedRoute role="tenant"><TenantPropertiesPage /></ProtectedRoute>} />
          <Route path="/tenant/categories" element={<ProtectedRoute role="tenant"><TenantCategoriesPage /></ProtectedRoute>} />
          <Route path="/tenant/rooms" element={<ProtectedRoute role="tenant"><TenantRoomsPage /></ProtectedRoute>} />
          <Route path="/tenant/availability" element={<ProtectedRoute role="tenant"><TenantAvailabilityPage /></ProtectedRoute>} />
          <Route path="/tenant/reviews" element={<ProtectedRoute role="tenant"><TenantReviewsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

