import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const fetchBookDetails = async (id) => {
  const { data } = await axios.get('/api/books');
  const foundBook = data.find((book) => book._id === id);
  if (foundBook) return foundBook;
  throw new Error('Book not found');
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: book, isLoading, isError } = useQuery({
    queryKey: ['books', id],
    queryFn: () => fetchBookDetails(id),
    enabled: !!id,
    retry: false,
    staleTime: 30000,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Error fetching book details');
    }
  }, [isError]);

  const handleRequestIssue = async () => {
    if (!fromDate || !toDate) {
      return toast.error('Please select both From and To dates.');
    }
    try {
      await axios.post('/api/transactions/request-issue', {
        bookId: id,
        fromDate,
        toDate
      }, { withCredentials: true });
      toast.success('Issue request submitted! Pending Admin approval.');
      setFromDate('');
      setToDate('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request issue');
    }
  };

  const { data: reservations = [], refetch: refetchReservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: async () => {
      const { data } = await axios.get('/api/reservations/my-reservations', { withCredentials: true });
      return data;
    },
    enabled: !!currentUser && currentUser.role === 'student',
    staleTime: 30000,
  });

  const handleReserveBook = async () => {
    try {
      await axios.post('/api/reservations/reserve', { bookId: id }, { withCredentials: true });
      toast.success('Book reserved successfully!');
      refetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve book');
    }
  };

  const existingReservation = reservations.find(res => res.book?._id === id && res.status === 'Pending');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">Loading...</div>;
  }

  if (!book || isError) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">Book not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-slate-500 hover:text-blue-600 font-medium transition-colors">
          &larr; Back to Catalog
        </button>

        <div className="bg-white rounded p-8 shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3 shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src={book.imageUrl} alt={book.title} className="w-full h-auto object-cover" />
              </div>
            </div>

            <div className="flex flex-col flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-500">{book.title}</h1>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 dark:text-blue-400 rounded text-sm font-semibold tracking-wide">
                    {book.category}
                  </span>
                </div>
                <p className="text-xl text-slate-500 dark:text-slate-400">by {book.author}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 p-6 bg-slate-100 rounded">
                <div>
                  <p className="text-sm font-bold text-slate-900">ISBN</p>
                  <p className="font-medium text-slate-500">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Publisher</p>
                  <p className="font-medium text-slate-500">{book.publisher}</p>
                </div>
                <div>
                  <p className="text-md font-bold text-slate-900">Publication Year</p>
                  <p className="font-medium text-slate-500">{book.year}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Total Copies</p>
                  <p className="font-medium text-slate-500">{book.quantity}</p>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Availability Status</p>
                    {book.availableCopies > 0 ? (
                      <p className="text-2xl font-bold text-emerald-500">{book.availableCopies} Copies Available</p>
                    ) : (
                      <p className="text-2xl font-bold text-rose-500">Currently Out of Stock</p>
                    )}
                  </div>
                </div>

                {currentUser && currentUser.role === 'student' && book.availableCopies > 0 && (
                  <div className="bg-slate-100 p-6 rounded border space-y-4">
                    <h3 className="font-bold text-slate-900">Request to Borrow</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">From Date</label>
                        <input
                          type="date"
                          value={fromDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white text-slate-500 border rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">To Date (Max 10 days)</label>
                        <input
                          type="date"
                          value={toDate}
                          min={fromDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white text-slate-500 border rounded outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleRequestIssue}
                      className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
                    >
                      Submit Request
                    </button>
                  </div>
                )}
                {currentUser && currentUser.role === 'student' && book.availableCopies === 0 && (
                  <div className="bg-slate-100 p-6 rounded border space-y-4">
                    <h3 className="font-bold text-slate-900">Book is Out of Stock</h3>
                    {existingReservation ? (
                      <div className="text-blue-600 font-medium bg-blue-50 px-6 py-4 rounded border border-blue-100">
                        You have reserved this book! (Queue Position: {existingReservation.queuePosition || 1})
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600">
                          All copies are currently issued. You can reserve this book to be added to the reservation queue.
                        </p>
                        <button
                          onClick={handleReserveBook}
                          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
                        >
                          Reserve Book
                        </button>
                      </>
                    )}
                  </div>
                )}
                {!currentUser && (
                  <div className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    Log in to borrow this book.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
