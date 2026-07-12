import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchUserTransactions = async () => {
  const res = await axios.get('/api/transactions/my-transactions', { withCredentials: true });
  return res.data;
};

const fetchUserReservations = async () => {
  const res = await axios.get('/api/reservations/my-reservations', { withCredentials: true });
  return res.data;
};

export default function StudentDashboard() {
  const { currentUser } = useSelector(state => state.user);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['student-transactions'],
    queryFn: fetchUserTransactions,
    staleTime: 30000,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['student-reservations'],
    queryFn: fetchUserReservations,
    staleTime: 30000,
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId) => {
      await axios.post('/api/reservations/cancel', { reservationId }, { withCredentials: true });
    },
    onSuccess: () => {
      toast.success('Reservation cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['student-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  });

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

  const requestReturnMutation = useMutation({
    mutationFn: async (transactionId) => {
      await axios.post('/api/transactions/request-return', { transactionId }, { withCredentials: true });
    },
    onSuccess: () => {
      toast.success('Return request submitted!');
      queryClient.invalidateQueries({ queryKey: ['student-transactions'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to request return');
    }
  });

  const handleRequestReturn = (transactionId) => {
    toast((t) => (
      <div className="p-1">
        <p className="text-sm font-semibold text-slate-800 mb-2">Request return for this book?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              requestReturnMutation.mutate(transactionId);
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

  const currentlyIssued = transactions.filter(t => t.status === 'Issued' || t.status === 'Pending_Return');
  const pendingRequests = transactions.filter(t => t.status === 'Pending_Issue');
  const pastHistory = transactions.filter(t => t.status === 'Returned' || t.status === 'Rejected');

  const activeCount = currentlyIssued.length + pendingRequests.length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="bg-white p-8 rounded shadow-sm border">
          <h1 className="text-3xl font-bold text-slate-500">Welcome back, {currentUser.name}!</h1>
          <p className="text-slate-500 mt-2">Manage your active issues, return requests, and track your fines.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-6 py-4 rounded border">
              <p className="text-md text-blue-600 font-bold">Active Books / Requests</p>
              <p className="text-3xl font-bold text-blue-400">{activeCount} / 4</p>
            </div>
            <div className="bg-emerald-100 p-6 py-4 rounded border">
              <p className="text-md text-emerald-600 font-bold">Returned Books</p>
              <p className="text-3xl font-bold text-emerald-400">{pastHistory.filter(t => t.status === 'Returned').length}</p>
            </div>
            <div className="bg-rose-100 p-6 py-4 rounded border">
              <p className="text-md text-rose-600 font-bold">Pending Fines</p>
              <p className="text-3xl font-bold text-rose-400">
                PKR {transactions.reduce((acc, curr) => (!curr.finePaid ? acc + curr.fineAmount : acc), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded shadow-sm border overflow-x-auto">
            <h2 className="text-xl text-[#0F172B] font-bold mb-4">Currently Issued Books</h2>
            {isLoading ? <p>Loading...</p> : currentlyIssued.length === 0 ? (
              <p className="text-slate-500">You have no issued books.</p>
            ) : (
              <table className="w-full text-slate-900 text-left border-collapse min-w-max">
                <thead className='bg-slate-100'>
                  <tr className="border text-slate-500">
                    <th className="p-3 font-medium">Book Details</th>
                    <th className="p-3 font-medium">Issue Date</th>
                    <th className="p-3 font-medium">Due Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentlyIssued.map(t => (
                    <tr key={t._id} className="border-b border-slate-100 transition-colors">
                      <td className="p-3">
                        <Link to={`/book/${t.book?._id}`} className="font-bold hover:text-blue-600 dark:hover:text-blue-400">{t.book?.title || 'Unknown Book'}</Link>
                      </td>
                      <td className="p-3">{new Date(t.issueDate).toLocaleDateString()}</td>
                      <td className={`p-3 font-medium ${new Date(t.dueDate) < new Date() ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {t.status === 'Pending_Return' ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">Return Requested</span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">Issued</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {t.status === 'Issued' && (
                          <button
                            disabled={requestReturnMutation.isPending && requestReturnMutation.variables === t._id}
                            onClick={() => handleRequestReturn(t._id)}
                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            {requestReturnMutation.isPending && requestReturnMutation.variables === t._id ? 'Requesting...' : 'Request Return'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow-sm border overflow-x-auto">
            <h2 className="text-xl text-slate-500 font-bold mb-4">Pending Issue Requests</h2>
            {isLoading ? <p>Loading...</p> : pendingRequests.length === 0 ? (
              <p className="text-slate-500">You have no pending requests.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead className='bg-slate-100'>
                  <tr className="text-slate-500">
                    <th className="p-3 font-medium">Book</th>
                    <th className="p-3 font-medium">Requested Duration</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(t => (
                    <tr key={t._id} className="text-slate-900">
                      <td className="p-3 font-medium">{t.book?.title || 'Unknown Book'}</td>
                      <td className="p-3 text-slate-600">
                        {new Date(t.issueDate).toLocaleDateString()} - {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-slate-500 text-slate-100 text-xs font-bold rounded">Waiting for Approval</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow-sm border overflow-x-auto">
            <h2 className="text-xl text-[#0F172B] font-bold mb-4">My Book Reservations</h2>
            {reservationsLoading ? <p>Loading...</p> : reservations.length === 0 ? (
              <p className="text-slate-500">You have no reservations.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead className='bg-slate-100'>
                  <tr className="border text-slate-500">
                    <th className="p-3 font-medium">Book</th>
                    <th className="p-3 font-medium">Reservation Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Queue Position</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r._id} className="text-slate-900 border-b border-slate-100">
                      <td className="p-3">
                        <Link to={`/book/${r.book?._id}`} className="font-bold hover:text-blue-600">
                          {r.book?.title || 'Unknown Book'}
                        </Link>
                      </td>
                      <td className="p-3">{new Date(r.reservationDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          r.status === 'Pending' ? 'bg-indigo-100 text-indigo-700' :
                          r.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">
                        {r.status === 'Pending' ? r.queuePosition || 1 : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {r.status === 'Pending' && (
                          <button
                            disabled={cancelReservationMutation.isPending && cancelReservationMutation.variables === r._id}
                            onClick={() => handleCancelReservation(r._id)}
                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            {cancelReservationMutation.isPending && cancelReservationMutation.variables === r._id ? 'Cancelling...' : 'Cancel Reservation'}
                          </button>
                        )}
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
