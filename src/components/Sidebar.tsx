import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Brain,
  Trophy,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/qa', label: 'Q&A', icon: MessageSquare },
    { path: '/summaries', label: 'Summaries', icon: FileText },
    { path: '/quiz', label: 'Quiz', icon: Brain },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-blue-500">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Smart Campus</h1>
            <p className="text-xs text-blue-200">Assistant</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700 hover:text-white transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
