import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Analytics() {
   const [stats, setStats] = useState({
      totalBooks: 0,
      totalUsers: 0,
      activeIssues: 0,
      pendingReservations: 0,
      totalFines: 0
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAnalytics();
   }, []);

   const fetchAnalytics = async () => {
      try {
         // This is a naive way to calculate stats in the frontend for demonstration.
         // In a real large app, a dedicated /api/analytics endpoint should do this aggregation.
         const [booksRes, txRes, resRes] = await Promise.all([
            axios.get('/api/books'),
            axios.get('/api/transactions', { withCredentials: true }),
            axios.get('/api/reservations', { withCredentials: true })
         ]);

         const books = booksRes.data;
         const txns = txRes.data;
         const reservations = resRes.data;

         const activeTxns = txns.filter(t => t.status === 'Issued');
         const pendingReqs = txns.filter(t => t.status === 'Pending_Issue');
         const finesCollected = txns.reduce((acc, curr) => curr.finePaid ? acc + (curr.fineAmount || 0) : acc, 0);

         setStats({
            totalBooks: books.length,
            totalUsers: 0, // Need user endpoint to get count
            activeIssues: activeTxns.length,
            pendingRequests: pendingReqs.length,
            totalFines: finesCollected
         });
      } catch (error) {
         toast.error("Failed to load analytics");
      } finally {
         setLoading(false);
      }
   };

   if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading Analytics...</div>;

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Library Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of system statistics and usage trends.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Cards */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Books</h3>
               <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalBooks}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Active Issues</h3>
               <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.activeIssues}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Pending Requests</h3>
               <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Fines Collected</h3>
               <p className="text-4xl font-bold text-rose-600 dark:text-rose-400 mt-2">${stats.totalFines}</p>
            </div>
         </div>

         <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/50 mt-8 text-center">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Visual Charts Placeholder</h2>
            <p className="text-blue-600/70 dark:text-blue-400/70 mt-2 max-w-md mx-auto">
               In a full production environment, this space will contain interactive visual charts (using Recharts or Chart.js) showing borrowing trends and book popularity statistics over time.
            </p>
         </div>
      </div>
   );
}
