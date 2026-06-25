import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBook, FaUsers, FaChartBar, FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { signInFailure, signInSuccess } from '../redux/authSlice';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        dispatch(signInSuccess(null));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 shadow-xl border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LibroAdmin</h2>
        </div>
        <nav className="flex-grow px-4 pb-4 space-y-2 mt-4">
          <Link
            to="/admin-dashboard"
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${location.pathname === '/admin-dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin-dashboard/manage-books"
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${location.pathname.includes('/manage-books') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <span>Manage Books</span>
          </Link>
          <Link
            to="/admin-dashboard/transactions"
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${location.pathname.includes('/transactions') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <span>Issue / Return</span>
          </Link>
          <Link
            to="/admin-dashboard/manage-users"
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${location.pathname.includes('/manage-users') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <span>Users</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
