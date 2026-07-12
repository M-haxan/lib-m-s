import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

const fetchRequests = async () => {
  const { data } = await axios.get('/api/transactions/requests', { withCredentials: true });
  return data;
};

const fetchTransactions = async () => {
  const { data } = await axios.get('/api/transactions', { withCredentials: true });
  return data.filter(t => !['Pending_Issue', 'Pending_Return'].includes(t.status));
};

const fetchReservations = async () => {
  const { data } = await axios.get('/api/reservations', { withCredentials: true });
  return data;
};

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('requests');
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['transaction-requests'],
    queryFn: fetchRequests,
    staleTime: 30000,
    enabled: activeTab === 'requests',
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 30000,
    enabled: activeTab === 'all',
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: fetchReservations,
    staleTime: 30000,
    enabled: activeTab === 'reservations',
  });

  const approveIssueMutation = useMutation({
    mutationFn: async (transactionId) => axios.post('/api/transactions/approve-issue', { transactionId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Issue approved successfully');
      queryClient.invalidateQueries({ queryKey: ['transaction-requests'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to approve')
  });

  const rejectIssueMutation = useMutation({
    mutationFn: async (transactionId) => axios.post('/api/transactions/reject-issue', { transactionId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Issue rejected');
      queryClient.invalidateQueries({ queryKey: ['transaction-requests'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to reject')
  });

  const approveReturnMutation = useMutation({
    mutationFn: async (transactionId) => axios.post('/api/transactions/approve-return', { transactionId }, { withCredentials: true }),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['transaction-requests'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to approve return')
  });

  const collectFineMutation = useMutation({
    mutationFn: async (transactionId) => axios.post('/api/transactions/collect-fine', { transactionId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Fine collected successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to collect fine')
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId) => axios.post('/api/reservations/cancel', { reservationId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Reservation cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to cancel reservation')
  });

  const handleApproveIssue = (transactionId) => approveIssueMutation.mutate(transactionId);
  const handleRejectIssue = (transactionId) => rejectIssueMutation.mutate(transactionId);
  const handleApproveReturn = (transactionId) => approveReturnMutation.mutate(transactionId);
  const handleCollectFine = (transactionId) => collectFineMutation.mutate(transactionId);
  const handleCancelReservation = (reservationId) => {
    toast((t) => (
      <div className="p-1">
        <p className="text-sm font-semibold text-slate-800 mb-2">Cancel reservation?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              cancelReservationMutation.mutate(reservationId);
            }}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold transition-all"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId) => axios.delete(`/api/transactions/${transactionId}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Transaction record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-requests'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete transaction record')
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (reservationId) => axios.delete(`/api/reservations/${reservationId}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success('Reservation record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete reservation record')
  });

  const handleDeleteTransaction = (transactionId) => {
    toast((t) => (
      <div className="p-1">
        <p className="text-sm font-semibold text-slate-800 mb-2">Delete this transaction history record?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteTransactionMutation.mutate(transactionId);
            }}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold transition-all"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleDeleteReservation = (reservationId) => {
    toast((t) => (
      <div className="p-1">
        <p className="text-sm font-semibold text-slate-800 mb-2">Delete this reservation record?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteReservationMutation.mutate(reservationId);
            }}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold transition-all"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const loading = activeTab === 'requests' ? requestsLoading : activeTab === 'all' ? transactionsLoading : reservationsLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Circulation & Requests</h1>
          <p className="text-slate-500 mt-1">Manage issue requests, returns, and collect fines.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`w-full sm:w-auto px-6 py-3 rounded hover:bg-blue-400 font-semibold transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md border'}`}
        >
          Pending Requests ({activeTab === 'requests' && !loading ? requests.length : '...'})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`w-full sm:w-auto px-6 py-3 hover:bg-blue-400 rounded font-semibold transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md border'}`}
        >
          All Transactions & Fines
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`w-full sm:w-auto px-6 py-3 hover:bg-blue-400 rounded font-semibold transition-all ${activeTab === 'reservations' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md border'}`}
        >
          Reservation Queue ({activeTab === 'reservations' && !loading ? reservations.length : '...'})
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className='bg-slate-200'>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
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
              ) : activeTab === 'reservations' && reservations.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No reservations found.</td></tr>
              ) : (
                (activeTab === 'requests' ? requests : activeTab === 'all' ? transactions : reservations).map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 capitalize">{txn.book?.title || 'Unknown Book'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 capitalize">{txn.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500">{txn.user?.email || txn.user?._id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {activeTab === 'reservations' ? (
                        <div><span className="font-medium">Reserved:</span> {new Date(txn.reservationDate).toLocaleDateString()}</div>
                      ) : (
                        <>
                          <div><span className="font-medium">From:</span> {new Date(txn.issueDate).toLocaleDateString()}</div>
                          <div><span className="font-medium">To:</span> {new Date(txn.dueDate).toLocaleDateString()}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'reservations' ? (
                        <>
                          <span className={`px-3 py-1 rounded text-xs font-bold
                            ${txn.status === 'Pending' ? 'bg-indigo-100 text-indigo-700' : ''}
                            ${txn.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${txn.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : ''}
                          `}>
                            {txn.status}
                          </span>
                          {txn.status === 'Pending' && (
                            <div className="mt-2 text-xs font-bold text-slate-500">
                              Queue Position: {txn.queuePosition || 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === 'reservations' ? (
                        <>
                          {txn.status === 'Pending' && (
                            <button
                              disabled={cancelReservationMutation.isPending && cancelReservationMutation.variables === txn._id}
                              onClick={() => handleCancelReservation(txn._id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {cancelReservationMutation.isPending && cancelReservationMutation.variables === txn._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                          <button
                            disabled={deleteReservationMutation.isPending && deleteReservationMutation.variables === txn._id}
                            onClick={() => handleDeleteReservation(txn._id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-sm font-semibold transition-all disabled:opacity-50"
                          >
                            {deleteReservationMutation.isPending && deleteReservationMutation.variables === txn._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <>
                          {txn.status === 'Pending_Issue' && (
                            <>
                              <button
                                disabled={approveIssueMutation.isPending && approveIssueMutation.variables === txn._id}
                                onClick={() => handleApproveIssue(txn._id)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                              >
                                {approveIssueMutation.isPending && approveIssueMutation.variables === txn._id ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                disabled={rejectIssueMutation.isPending && rejectIssueMutation.variables === txn._id}
                                onClick={() => handleRejectIssue(txn._id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                              >
                                {rejectIssueMutation.isPending && rejectIssueMutation.variables === txn._id ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {txn.status === 'Pending_Return' && (
                            <button
                              disabled={approveReturnMutation.isPending && approveReturnMutation.variables === txn._id}
                              onClick={() => handleApproveReturn(txn._id)}
                              className="px-3 py-1.5 bg-indigo-50 text-slate-900 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {approveReturnMutation.isPending && approveReturnMutation.variables === txn._id ? 'Approving...' : 'Approve Return'}
                            </button>
                          )}
                          {txn.status === 'Returned' && txn.fineAmount > 0 && !txn.finePaid && (
                            <button
                              disabled={collectFineMutation.isPending && collectFineMutation.variables === txn._id}
                              onClick={() => handleCollectFine(txn._id)}
                              className="px-3 py-1.5 bg-amber-50 text-slate-900 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {collectFineMutation.isPending && collectFineMutation.variables === txn._id ? 'Collecting...' : 'Collect Fine'}
                            </button>
                          )}
                          <button
                            disabled={deleteTransactionMutation.isPending && deleteTransactionMutation.variables === txn._id}
                            onClick={() => handleDeleteTransaction(txn._id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-sm font-semibold transition-all disabled:opacity-50"
                          >
                            {deleteTransactionMutation.isPending && deleteTransactionMutation.variables === txn._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
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
