import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function Home() {
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: urlSearchQuery,
    category: 'All',
    availability: 'all',
    year: ''
  });

  const categories = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts', 'Biography'];

  // Update local search if URL search param changes (from Navbar)
  useEffect(() => {
     setFilters(prev => ({ ...prev, search: urlSearchQuery }));
  }, [urlSearchQuery]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
      if (filters.year) queryParams.append('year', filters.year);

      const { data } = await axios.get(`/api/books?${queryParams.toString()}`);
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
        console.error("Expected array from API but got:", data);
      }
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Discover Your Next Great Read</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore our extensive collection of books. Search by title, author, category, or filter by availability.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <FaSearch />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title or author..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            
            {/* Category Filter */}
            <div className="md:col-span-3">
               <select
                 name="category"
                 value={filters.category}
                 onChange={handleFilterChange}
                 className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all dark:text-white"
               >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            {/* Availability Filter */}
            <div className="md:col-span-2">
               <select
                 name="availability"
                 value={filters.availability}
                 onChange={handleFilterChange}
                 className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all dark:text-white"
               >
                 <option value="all">All Status</option>
                 <option value="true">Available</option>
                 <option value="false">Issued Out</option>
               </select>
            </div>

            {/* Year Filter */}
            <div className="md:col-span-2">
               <input
                 type="number"
                 name="year"
                 value={filters.year}
                 onChange={handleFilterChange}
                 placeholder="Year"
                 className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
               />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading && books.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {[1, 2, 3, 4, 5].map(n => (
               <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                 <div className="w-full aspect-[2/3] bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
                 <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                 <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
               </div>
             ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No books found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map(book => (
              <Link 
                to={`/book/${book._id}`} 
                key={book._id} 
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-inner">
                  <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {book.availableCopies === 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md">Issued Out</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{book.author}</p>
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                      {book.category}
                    </span>
                    <span className={`text-xs font-semibold ${book.availableCopies > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} available` : '0 available'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
