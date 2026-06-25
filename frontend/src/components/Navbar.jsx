import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaUserCircle, FaSearch, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Optional: poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications', { withCredentials: true });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        dispatch(signInSuccess(null));
        toast.success('Logged out successfully');
        navigate('/');
      }
    } catch (error) {
       toast.error(error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
       navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const SearchBar = () => (
    <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 hidden md:flex">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search catalog..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-400  rounded bg-[#FFFFFF]  text-sm focus:outline-none    transition-all text-slate-900"
        />
      </div>
    </form>
  );

  return (
    <nav className="bg-[#FFFFFF] sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo (Left) */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-slate-500  hidden sm:block">
                Libro
              </span>
            </Link>
          </div>

          <SearchBar />

          {/* Right Side Items */}
          <div className="hidden lg:flex items-center space-x-6">
            
            <div className="flex space-x-4">
               {!currentUser && (
                  <>
                     <Link to="/" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-md font-semibold transition-colors">Home</Link>
                     <Link to="/catalog" className="text-slate-500  hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-md font-semibold transition-colors">Catalog</Link>
                  </>
               )}
               {currentUser?.role === 'student' && (
                  <>
                    <Link to="/" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Home</Link>
                    <Link to="/catalog" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Catalog</Link>
                    <Link to="/student-dashboard" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Dashboard</Link>
                  </>
               )}
               {currentUser?.role === 'admin' && (
                  <>
                    <Link to="/admin-dashboard" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Dashboard</Link>
                    <Link to="/admin-dashboard/manage-books" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Books</Link>
                    <Link to="/admin-dashboard/transactions" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">Circulation & Fines</Link>
                  </>
               )}
            </div>

            <div className="flex items-center pl-6 border-l border-slate-200 dark:border-slate-700 space-x-4">
              {!currentUser ? (
                <>
                  <Link to="/signin" className="text-slate-500 hover:bg-blue-600 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="text-slate-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-sm font-medium">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                       onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                       className="text-slate-400 hover:text-blue-600 relative transition-colors p-1 focus:outline-none"
                    >
                      <FaBell size={20} />
                      {unreadCount > 0 && (
                         <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl py-2 border border-slate-100 dark:border-slate-700 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && (
                             <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {notifications.length === 0 ? (
                             <p className="p-4 text-center text-sm text-slate-500">No notifications.</p>
                           ) : (
                             notifications.map(notif => (
                               <div key={notif._id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{notif.message}</p>
                                  <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                      className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      <FaUserCircle size={24} />
                      <span className="text-sm font-medium hidden xl:block">{currentUser.name}</span>
                    </button>
                    
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl py-1 border border-slate-100 dark:border-slate-700 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                           <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                        </div>
                        <Link to={currentUser.role === 'admin' ? "/admin-dashboard" : "/student-dashboard"} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                          My Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden space-x-4">
             {currentUser && (
               <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-400 hover:text-blue-600 relative p-1">
                    <FaBell size={20} />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>}
                 </button>
                 {showNotifications && (
                      <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl py-2 border border-slate-100 dark:border-slate-700 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>}
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                           {notifications.map(notif => (
                             <div key={notif._id} className="p-3 border-b border-slate-50 dark:border-slate-700/50">
                                <p className="text-sm">{notif.message}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                 )}
               </div>
             )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          
          <div className="flex flex-col space-y-2">
            {!currentUser && (
               <>
                 <Link to="/" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Home</Link>
                 <Link to="/catalog" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Catalog</Link>
                 <Link to="/signin" className="text-blue-600 font-medium px-3 py-2">Login</Link>
                 <Link to="/signup" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Register</Link>
               </>
            )}
            {currentUser?.role === 'student' && (
               <>
                 <Link to="/" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Home</Link>
                 <Link to="/catalog" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Catalog</Link>
                 <Link to="/student-dashboard" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Dashboard</Link>
                 <button onClick={handleLogout} className="text-left text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg font-medium">Logout</button>
               </>
            )}
            {currentUser?.role === 'admin' && (
               <>
                 <Link to="/admin-dashboard" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Dashboard</Link>
                 <Link to="/admin-dashboard/manage-books" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Books</Link>
                 <Link to="/admin-dashboard/transactions" className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium">Circulation</Link>
                 <button onClick={handleLogout} className="text-left text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg font-medium">Logout</button>
               </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
