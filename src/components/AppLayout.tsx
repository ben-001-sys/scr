import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shared app shell with simple navigation for authenticated pages.
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logs out locally and sends user back to login page.
  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 border-b border-base-300 px-4">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-lg">
            Ecom Frontend
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/products" className="btn btn-ghost btn-sm">
            Products
          </Link>
          {user?.role === 'ADMIN' && (
            <Link to="/products/new" className="btn btn-ghost btn-sm">
              Create Product
            </Link>
          )}
          <span className="badge badge-outline">{user?.role}</span>
          <button type="button" className="btn btn-sm btn-error btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
