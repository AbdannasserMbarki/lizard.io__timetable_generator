import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, Users, BookOpen, DoorOpen, UsersRound, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import TeachersPage from './pages/Teachers';
import SubjectsPage from './pages/Subjects';
import RoomsPage from './pages/Rooms';
import GroupsPage from './pages/Groups';
import TimetablePage from './pages/Timetable';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import TeacherPreferencesPage from './pages/TeacherPreferences';
import logo from './assets/logo.svg'

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <OrbitProgress variant="dotted" color="#32cd32" size="medium" text="" textColor="" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Main Layout Component
function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b-4 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img src={logo} alt="Logo"  className="h-8 w-8 text-gray-900" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    lizard.io
                  </span>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                  >
                    Home
                  </Link>
                  
                  {user?.role === 'teacher' && (
                    <Link
                      to="/preferences"
                      className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      My Preferences
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/timetable"
                        className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Timetable
                      </Link>
                      <Link
                        to="/teachers"
                        className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Teachers
                      </Link>
                      <Link
                        to="/subjects"
                        className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Subjects
                      </Link>
                      <Link
                        to="/rooms"
                        className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                      >
                        <DoorOpen className="h-4 w-4 mr-1" />
                        Rooms
                      </Link>
                      <Link
                        to="/groups"
                        className="inline-flex items-center px-4 pt-1 border-b-4 border-transparent text-sm font-bold text-gray-900 hover:border-gray-900"
                      >
                        <UsersRound className="h-4 w-4 mr-1" />
                        Groups
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <>
                    <span className="text-sm font-bold text-gray-900">
                      {user.name} ({user.role})
                    </span>
                    <button
                      onClick={logout}
                      className="inline-flex items-center px-3 py-1 border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white font-bold"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/preferences" element={
              <ProtectedRoute>
                <TeacherPreferencesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/timetable" element={
              <ProtectedRoute adminOnly>
                <TimetablePage />
              </ProtectedRoute>
            } />
            
            <Route path="/teachers" element={
              <ProtectedRoute adminOnly>
                <TeachersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/subjects" element={
              <ProtectedRoute adminOnly>
                <SubjectsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/rooms" element={
              <ProtectedRoute adminOnly>
                <RoomsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/groups" element={
              <ProtectedRoute adminOnly>
                <GroupsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
