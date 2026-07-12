import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBook, FaUsers, FaChartBar, FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { signInFailure, signInSuccess } from '../redux/authSlice';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]  text-slate-800 dark:text-slate-200">
  
      {/* Sidebar Drawer */}
      <aside
        className={`bg-white shadow-xl border-r flex flex-col transition-all duration-300 z-40
          fixed inset-y-0 left-0 w-56 md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="flex-grow px-4 pb-4 space-y-2 mt-4">
          <Link
            to="/admin-dashboard"
            onClick={closeSidebar}
            className={`flex text-slate-500 items-center space-x-3 p-3 rounded transition-all duration-200 ${location.pathname === '/admin-dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-200 '}`}
          >
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin-dashboard/manage-books"
            onClick={closeSidebar}
            className={`flex text-slate-500 items-center space-x-3 p-3 rounded transition-all duration-200 ${location.pathname.includes('/manage-books') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-200 '}`}
          >
            <span>Manage Books</span>
          </Link>
          <Link
            to="/admin-dashboard/transactions"
            onClick={closeSidebar}
            className={`flex text-slate-500 items-center space-x-3 p-3 rounded transition-all duration-200 ${location.pathname.includes('/transactions') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-200 '}`}
          >
            <span>Issue / Return</span>
          </Link>
          <Link
            to="/admin-dashboard/manage-users"
            onClick={closeSidebar}
            className={`flex text-slate-500 items-center space-x-3 p-3 rounded transition-all duration-200 ${location.pathname.includes('/manage-users') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-slate-200 '}`}
          >
            <span>Users</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-200  text-rose-600 dark:text-rose-400 rounded hover:bg-rose-100  transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
