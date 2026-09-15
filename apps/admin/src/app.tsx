import { useCallback, useState } from 'react';
import { AdminDashboard, getAdminView } from './admin-shell';
import { LoginPage } from './features/auth/login-page';

export function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const handleAuthenticated = useCallback((email: string) => setUserEmail(email), []);
  return getAdminView(userEmail) === 'dashboard'
    ? <AdminDashboard userEmail={userEmail!} onLogout={() => setUserEmail(null)} />
    : <LoginPage onAuthenticated={handleAuthenticated} />;
}
