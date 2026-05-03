import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Register screen that calls backend /auth/register with RegisterDto fields.
export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sends register payload to backend and redirects after success.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Register</h1>
          <p className="text-sm opacity-70">Create a new account in your Nest backend.</p>
          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <label className="form-control w-full">
              <span className="label-text">First Name</span>
              <input
                className="input input-bordered w-full"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Last Name</span>
              <input
                className="input input-bordered w-full"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Email</span>
              <input
                className="input input-bordered w-full"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Password</span>
              <input
                className="input input-bordered w-full"
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </label>
            {error && <p className="text-error text-sm">{error}</p>}
            <button className={`btn btn-primary w-full ${isSubmitting ? 'btn-disabled' : ''}`} type="submit">
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="text-sm mt-2">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
