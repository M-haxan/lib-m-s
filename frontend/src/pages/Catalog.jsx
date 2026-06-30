import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFire, FaThumbsUp } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const fetchBooks = async (filters) => {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.category !== 'All') queryParams.append('category', filters.category);
  if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
  if (filters.year) queryParams.append('year', filters.year);

  const { data } = await axios.get(`/api/books?${queryParams.toString()}`);
  if (Array.isArray(data)) {
    return data;
  }

  throw new Error('Expected array from API');
};

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  const { currentUser } = useSelector(state => state.user || {});

  const [filters, setFilters] = useState({
    search: urlSearchQuery,
    category: 'All',
    availability: 'all',
    year: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const categories = ['Select Category', 'All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts', 'Biography'];

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: urlSearchQuery }));
  }, [urlSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // Query all books with search & filter parameters
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', debouncedFilters.search, debouncedFilters.category, debouncedFilters.availability, debouncedFilters.year],
    queryFn: () => fetchBooks(debouncedFilters),
    staleTime: 30000,
  });

  // Query top 5 books matching user preferences
  const { data: recommendedBooks = [] } = useQuery({
    queryKey: ['recommendedBooks', currentUser?._id],
    queryFn: async () => {
      const { data } = await axios.get('/api/books/recommended', { withCredentials: true });
      return data;
    },
    enabled: !!currentUser,
    staleTime: 60000,
  });

  // Query top 5 most issued books
  const { data: mostIssuedBooks = [] } = useQuery({
    queryKey: ['mostIssuedBooks'],
    queryFn: async () => {
      const { data } = await axios.get('/api/books/most-issued');
      return data;
    },
    staleTime: 60000,
  });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Discover Your Next Great Read</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our extensive collection of books. Search by title, author, category, or filter by availability.</p>
        </div>

        {/* 1. Recommended Books Section (Logged in users only) */}
        {currentUser && recommendedBooks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <FaThumbsUp className="text-blue-600 text-xl" />
              <h2 className="text-2xl font-bold text-slate-800">Recommended For You</h2>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Interests</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommendedBooks.map(book => (
                <Link
                  to={`/book/${book._id}`}
                  key={`rec-${book._id}`}
                  className="group flex flex-col bg-white rounded p-3 shadow-sm hover:shadow-xl border hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3 shadow-inner">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {book.availableCopies === 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">Issued Out</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-semibold text-slate-800 capitalize group-hover:text-blue-600 transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-slate-500 capitalize line-clamp-1">{book.author}</p>
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {book.category}
                      </span>
                      <span className={`text-[10px] font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Left` : '0 Left'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. Most Issued Books Section */}
        {mostIssuedBooks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <FaFire className="text-orange-500 text-xl" />
              <h2 className="text-2xl font-bold text-slate-800">Trending Books</h2>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Most Borrowed</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {mostIssuedBooks.map(book => (
                <Link
                  to={`/book/${book._id}`}
                  key={`most-${book._id}`}
                  className="group flex flex-col bg-white rounded p-3 shadow-sm hover:shadow-xl border hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3 shadow-inner">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {book.availableCopies === 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">Issued Out</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-semibold text-slate-800 capitalize group-hover:text-orange-500 transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-slate-500 capitalize line-clamp-1">{book.author}</p>
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {book.category}
                      </span>
                      <span className={`text-[10px] font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Left` : '0 Left'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 3. General Book List Section */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold text-slate-800">All Books Catalog</h2>
          </div>

          {/* Filters card */}
          <div className="bg-white p-6 rounded shadow-xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
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
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border rounded text-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none appearance-none transition-all text-slate-500 focus:border-blue-500 focus:bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none transition-all text-slate-500 focus:border-blue-500 focus:bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="true">Available</option>
                  <option value="false">Issued Out</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <input
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  placeholder="Year"
                  className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none transition-all text-slate-500 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          {isLoading && books.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
                  <div className="w-full aspect-[2/3] bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20 bg-white rounded border border-slate-150">
              <h3 className="text-2xl font-semibold text-slate-700">No books found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map(book => (
                <Link
                  to={`/book/${book._id}`}
                  key={book._id}
                  className="group flex flex-col bg-white rounded p-3 shadow-sm hover:shadow-xl border hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[4/5] rounded overflow-hidden mb-3 shadow-inner">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {book.availableCopies === 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">Issued Out</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-semibold text-slate-800 capitalize group-hover:text-blue-600 transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-slate-500 capitalize line-clamp-1">{book.author}</p>
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {book.category}
                      </span>
                      <span className={`text-[10px] font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Left` : '0 Left'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
