import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { currentUser } = useSelector(state => state.user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/transactions/my-transactions', { withCredentials: true });
      setTransactions(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async (transactionId) => {
    if (!window.confirm("Are you sure you want to request a return for this book?")) return;
    try {
      await axios.post('/api/transactions/request-return', { transactionId }, { withCredentials: true });
      toast.success("Return request submitted!");
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request return");
    }
  };

  const currentlyIssued = transactions.filter(t => t.status === 'Issued' || t.status === 'Pending_Return');
  const pendingRequests = transactions.filter(t => t.status === 'Pending_Issue');
  const pastHistory = transactions.filter(t => t.status === 'Returned' || t.status === 'Rejected');

  const activeCount = currentlyIssued.length + pendingRequests.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h1 className="text-3xl font-bold">Welcome back, {currentUser.name}!</h1>
          <p className="text-slate-500 mt-2">Manage your active issues, return requests, and track your fines.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Books / Requests</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{activeCount} / 4</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Returned Books</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{pastHistory.filter(t => t.status === 'Returned').length}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 px-6 py-4 rounded-2xl border border-rose-100 dark:border-rose-900/50">
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Pending Fines</p>
              <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                ${transactions.reduce((acc, curr) => (!curr.finePaid ? acc + curr.fineAmount : acc), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Currently Issued Books */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Currently Issued Books</h2>
            {loading ? <p>Loading...</p> : currentlyIssued.length === 0 ? (
              <p className="text-slate-500">You have no issued books.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="p-3 font-medium">Book Details</th>
                    <th className="p-3 font-medium">Issue Date</th>
                    <th className="p-3 font-medium">Due Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentlyIssued.map(t => (
                    <tr key={t._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                         <Link to={`/book/${t.book?._id}`} className="font-bold hover:text-blue-600 dark:hover:text-blue-400">{t.book?.title || 'Unknown Book'}</Link>
                      </td>
                      <td className="p-3">{new Date(t.issueDate).toLocaleDateString()}</td>
                      <td className={`p-3 font-medium ${new Date(t.dueDate) < new Date() ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                         {t.status === 'Pending_Return' ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Return Requested</span>
                         ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Issued</span>
                         )}
                      </td>
                      <td className="p-3 text-right">
                         {t.status === 'Issued' && (
                           <button onClick={() => handleRequestReturn(t._id)} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-colors">
                             Request Return
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending Issue Requests */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Pending Issue Requests</h2>
            {loading ? <p>Loading...</p> : pendingRequests.length === 0 ? (
              <p className="text-slate-500">You have no pending requests.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="p-3 font-medium">Book</th>
                    <th className="p-3 font-medium">Requested Duration</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(t => (
                    <tr key={t._id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-3 font-medium">{t.book?.title || 'Unknown Book'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                         {new Date(t.issueDate).toLocaleDateString()} - {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-xs font-bold rounded-md">Waiting for Approval</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
