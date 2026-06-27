import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';

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

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', debouncedFilters.search, debouncedFilters.category, debouncedFilters.availability, debouncedFilters.year],
    queryFn: () => fetchBooks(debouncedFilters),
    staleTime: 30000,
  });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Discover Your Next Great Read</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore our extensive collection of books. Search by title, author, category, or filter by availability.</p>
        </div>

        <div className="bg-white p-6 rounded shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700">
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
                className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border rounded text-slate-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-3">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none appearance-none transition-all text-slate-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none transition-all text-slate-500"
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
                className="w-full px-4 py-4 bg-[#F8F9FA] border rounded outline-none transition-all text-slate-500"
              />
            </div>
          </div>
        </div>

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
          <div className="text-center py-20">
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
                <div className="relative w-full aspect-[4/5] rounded overflow-hidden mb-4 shadow-inner">
                  <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {book.availableCopies === 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded backdrop-blur-md">Issued Out</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-slate-900 capitalize group-hover:text-blue-600 transition-colors">{book.title}</h3>
                  <p className="text-sm text-slate-500 capitalize">{book.author}</p>
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
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
