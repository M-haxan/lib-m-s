import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Analytics() {
   const [stats, setStats] = useState({
      totalBooks: 0,
      totalUsers: 0,
      activeIssues: 0,
      pendingRequests: 0,
      totalFines: 0
   });
   const [loading, setLoading] = useState(true);
   const [transactionsData, setTransactionsData] = useState([]);

   useEffect(() => {
      fetchAnalytics();
   }, []);

   const fetchAnalytics = async () => {
      try {
         const [booksRes, txRes, usersRes] = await Promise.all([
            axios.get('/api/books'),
            axios.get('/api/transactions', { withCredentials: true }),
            axios.get('/api/users', { withCredentials: true })
         ]);

         const books = booksRes.data;
         const txns = txRes.data;
         const users = usersRes.data;

         setTransactionsData(txns);

         const activeTxns = txns.filter(t => t.status === 'Issued');
         const pendingReqs = txns.filter(t => t.status === 'Pending_Issue');
         const finesCollected = txns.reduce((acc, curr) => curr.finePaid ? acc + (curr.fineAmount || 0) : acc, 0);

         setStats({
            totalBooks: books.length,
            totalUsers: users.length,
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

   const exportPDF = () => {
      const doc = new jsPDF();
      doc.text("Library Analytics Report", 14, 15);
      
      doc.autoTable({
         startY: 25,
         head: [['Total Books', 'Total Users', 'Active Issues', 'Pending Requests', 'Fines Collected (PKR)']],
         body: [[stats.totalBooks, stats.totalUsers, stats.activeIssues, stats.pendingRequests, stats.totalFines]],
      });

      doc.text("Recent Transactions", 14, doc.lastAutoTable.finalY + 15);
      
      const tableData = transactionsData.slice(0, 50).map(t => [
         t.book?.title || 'N/A',
         t.user?.name || 'N/A',
         t.status,
         t.fineAmount ? `PKR ${t.fineAmount}` : 'None',
         new Date(t.createdAt).toLocaleDateString()
      ]);

      doc.autoTable({
         startY: doc.lastAutoTable.finalY + 20,
         head: [['Book', 'User', 'Status', 'Fine', 'Date']],
         body: tableData,
      });

      doc.save("library_report.pdf");
      toast.success("PDF Downloaded");
   };

   const exportExcel = () => {
      const summaryData = [
         { Metric: 'Total Books', Value: stats.totalBooks },
         { Metric: 'Total Users', Value: stats.totalUsers },
         { Metric: 'Active Issues', Value: stats.activeIssues },
         { Metric: 'Pending Requests', Value: stats.pendingRequests },
         { Metric: 'Fines Collected (PKR)', Value: stats.totalFines },
      ];

      const txnData = transactionsData.map(t => ({
         Book: t.book?.title || 'N/A',
         User: t.user?.name || 'N/A',
         Status: t.status,
         Fine: t.fineAmount || 0,
         Date: new Date(t.createdAt).toLocaleDateString()
      }));

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      const wsTxns = XLSX.utils.json_to_sheet(txnData);

      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
      XLSX.utils.book_append_sheet(wb, wsTxns, "Transactions");

      XLSX.writeFile(wb, "library_report.xlsx");
      toast.success("Excel Downloaded");
   };

   if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading Analytics...</div>;

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-4">
            <div>
               <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Library Analytics</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of system statistics and usage trends.</p>
            </div>
            <div className="flex space-x-3">
               <button onClick={exportPDF} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl text-sm font-semibold transition-colors">
                  Download PDF
               </button>
               <button onClick={exportExcel} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-colors">
                  Download Excel
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Books</h3>
               <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalBooks}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Users</h3>
               <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{stats.totalUsers}</p>
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
               <h3 className="text-slate-500 dark:text-slate-400 font-medium">Fines Collected</h3>
               <p className="text-4xl font-bold text-rose-600 dark:text-rose-400 mt-2">PKR {stats.totalFines}</p>
            </div>
         </div>
      </div>
   );
}
