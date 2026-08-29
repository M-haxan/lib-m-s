import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/transactions/requests', { withCredentials: true });
      setRequests(data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/transactions', { withCredentials: true });
      // Only show Issued, Returned, Rejected in all transactions (not pending requests)
      setTransactions(data.filter(t => !['Pending_Issue', 'Pending_Return'].includes(t.status)));
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveIssue = async (transactionId) => {
    try {
      await axios.post('/api/transactions/approve-issue', { transactionId }, { withCredentials: true });
      toast.success('Issue approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectIssue = async (transactionId) => {
    try {
      await axios.post('/api/transactions/reject-issue', { transactionId }, { withCredentials: true });
      toast.success('Issue rejected');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleApproveReturn = async (transactionId) => {
    try {
      const res = await axios.post('/api/transactions/approve-return', { transactionId }, { withCredentials: true });
      toast.success(res.data.message);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve return');
    }
  };

  const handleCollectFine = async (transactionId) => {
    try {
      await axios.post('/api/transactions/collect-fine', { transactionId }, { withCredentials: true });
      toast.success('Fine collected successfully!');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect fine');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white  p-6 rounded shadow-sm border ">
        <div>
          <h1 className="text-3xl font-bold text-slate-500 ">Circulation & Requests</h1>
          <p className="text-slate-500  mt-1">Manage issue requests, returns, and collect fines.</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 rounded hover:bg-blue-400 font-semibold transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md '}`}
        >
          Pending Requests ({activeTab === 'requests' && !loading ? requests.length : '...'})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 hover:bg-blue-400 rounded font-semibold transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md border '}`}
        >
          All Transactions & Fines
        </button>
      </div>

      <div className="bg-white  rounded shadow-sm border  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className='bg-slate-200'>
              <tr className="bg-slate-50  text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Book Details</th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Status/Fine</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 animate-pulse">Loading data...</td></tr>
              ) : activeTab === 'requests' && requests.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No pending requests found.</td></tr>
              ) : activeTab === 'all' && transactions.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found.</td></tr>
              ) : (
                (activeTab === 'requests' ? requests : transactions).map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-100  transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 capitalize ">{txn.book?.title || 'Unknown Book'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 capitalize">{txn.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500">{txn.user?.email || txn.user?._id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div><span className="font-medium">From:</span> {new Date(txn.issueDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">To:</span> {new Date(txn.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-bold 
                        ${txn.status === 'Pending_Issue' ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${txn.status === 'Pending_Return' ? 'bg-amber-100 text-amber-700' : ''}
                        ${txn.status === 'Issued' ? 'bg-blue-100 text-blue-700' : ''}
                        ${txn.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${txn.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {txn.status.replace('_', ' ')}
                      </span>
                      {txn.fineAmount > 0 && (
                        <div className={`mt-2 text-xs font-bold ${txn.finePaid ? 'text-emerald-500' : 'text-rose-600'}`}>
                          Fine: PKR {txn.fineAmount} ({txn.finePaid ? 'Paid' : 'Unpaid'})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {txn.status === 'Pending_Issue' && (
                        <>
                          <button onClick={() => handleApproveIssue(txn._id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-sm font-semibold transition-colors">Approve</button>
                          <button onClick={() => handleRejectIssue(txn._id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-semibold transition-colors">Reject</button>
                        </>
                      )}
                      {txn.status === 'Pending_Return' && (
                        <button onClick={() => handleApproveReturn(txn._id)} className="px-3 py-1.5 bg-indigo-50 text-slate-900  rounded text-sm font-semibold transition-colors">
                          Approve Return
                        </button>
                      )}
                      {txn.status === 'Returned' && txn.fineAmount > 0 && !txn.finePaid && (
                        <button onClick={() => handleCollectFine(txn._id)} className="px-3 py-1.5 bg-amber-50 text-slate-900  rounded text-sm font-semibold transition-colors">
                          Collect Fine
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
