import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Copyright */}
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Libro Library. All rights reserved.
        </div>

        {/* Links */}
        <div className="flex space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="#" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">Help/FAQ</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">Contact Admin</Link>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-4 text-slate-400">
          <a href="#" className="hover:text-blue-600 transition-colors"><FaFacebook size={20} /></a>
          <a href="#" className="hover:text-blue-400 transition-colors"><FaTwitter size={20} /></a>
          <a href="#" className="hover:text-rose-500 transition-colors"><FaInstagram size={20} /></a>
          <a href="#" className="hover:text-blue-700 transition-colors"><FaLinkedin size={20} /></a>
        </div>
      </div>
    </footer>
  );
}
