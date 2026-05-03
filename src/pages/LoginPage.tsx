import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Login screen that calls backend /auth/login.
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Submits login credentials and redirects to dashboard on success.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Login</h1>
          <p className="text-sm opacity-70">Use your backend account to continue.</p>
          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <label className="form-control w-full">
              <span className="label-text">Email</span>
              <input
                className="input input-bordered w-full"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Password</span>
              <input
                className="input input-bordered w-full"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {error && <p className="text-error text-sm">{error}</p>}
            <button className={`btn btn-primary w-full ${isSubmitting ? 'btn-disabled' : ''}`} type="submit">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-sm mt-2">
            No account?{' '}
            <Link to="/register" className="link link-primary">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
