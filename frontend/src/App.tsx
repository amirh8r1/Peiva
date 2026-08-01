import { useRole } from './context/RoleContext';
import { AppRouter } from './router';

export default function App() {
  const { role } = useRole();
  // Key on role so React re-mounts the entire router tree on role switch,
  // resetting all page state (wizard, proposals, etc.)
  return <AppRouter key={role} />;
}
