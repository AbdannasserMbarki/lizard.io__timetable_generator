import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="border-4 border-gray-900 bg-white p-8">
          <div className="mb-8">
            <LogIn className="h-12 w-12 text-gray-900 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-700">Access the timetable management system</p>
          </div>

          {error && (
            <div className="mb-4 p-3 border-2 border-gray-900 bg-red-50 text-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-3 font-bold"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-900">
            <p className="text-sm text-gray-700">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-gray-900 underline">
                Register as a teacher
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 border-2 border-gray-900 bg-gray-50">
            <p className="text-xs font-bold mb-1">Default Admin Credentials:</p>
            <p className="text-xs">Email: admin@university.edu</p>
            <p className="text-xs">Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
