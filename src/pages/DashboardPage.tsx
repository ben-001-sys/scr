import { useAuth } from '../context/AuthContext';

// Simple dashboard showing who is logged in and available actions.
export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Welcome</h2>
          <p>
            Logged in as <span className="font-semibold">{user?.email}</span>
          </p>
          <p>
            Name: {user?.firstName ?? '-'} {user?.lastName ?? ''}
          </p>
          <p>Role: {user?.role}</p>
        </div>
      </div>
    </div>
  );
}
