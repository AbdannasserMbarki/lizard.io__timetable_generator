import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    maxLoadPerWeek: 20
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      maxLoadPerWeek: parseInt(formData.maxLoadPerWeek)
    });

    if (result.success) {
      navigate('/preferences');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12">
      <div className="w-full max-w-md">
        <div className="border-4 border-gray-900 bg-white p-8">
          <div className="mb-8">
            <UserPlus className="h-12 w-12 text-gray-900 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register</h1>
            <p className="text-gray-700">Create your teacher account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 border-2 border-gray-900 bg-red-50 text-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="john.doe@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
                placeholder="Re-enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Max Load Per Week (hours)</label>
              <input
                type="number"
                name="maxLoadPerWeek"
                min="1"
                max="40"
                value={formData.maxLoadPerWeek}
                onChange={handleChange}
                className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-3 font-bold"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-900">
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-gray-900 underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
