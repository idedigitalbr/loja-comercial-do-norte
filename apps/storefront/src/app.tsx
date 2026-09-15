import { StorefrontRoutes } from './routes/router';
import { StorefrontShell } from './components/storefront-shell';

export function App() {
  return (
    <StorefrontShell>
      <StorefrontRoutes />
    </StorefrontShell>
  );
}
