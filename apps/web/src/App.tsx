import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/LandingPage';
import { AuthProvider } from './features/auth/stores/AuthContext.js';
import {
  LoginPage,
  RegisterPage,
  VerifyPage,
  CheckEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProfilePage,
} from './features/auth/pages/index.js';

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
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
