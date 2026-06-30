import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchUsers = async () => {
  const { data } = await axios.get('/api/users', { withCredentials: true });
  return data;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 30000,
    onError: () => toast.error('Failed to fetch users')
  });

  const approveUserMutation = useMutation({
    mutationFn: async (id) => axios.put(`/api/users/${id}/approve`, {}, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Student account approved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve student account');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => axios.delete(`/api/users/${id}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Student account deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete student account');
    }
  });

  const handleApprove = (id) => {
    approveUserMutation.mutate(id);
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="p-1">
        <p className="text-sm font-semibold text-slate-800 mb-2">Delete student account?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteUserMutation.mutate(id);
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

  const students = users.filter(user => user.role === 'student');
  const activeStudents = students.filter(user => user.isApproved !== false);
  const pendingStudents = students.filter(user => user.isApproved === false);
  const displayedStudents = activeTab === 'active' ? activeStudents : pendingStudents;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded shadow-sm border">
        <h1 className="text-3xl font-bold text-blue-600">Registered Students</h1>
        <p className="text-slate-500 mt-1">View and manage student accounts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded shadow-sm">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 font-bold text-sm border-b-2 text-center transition-all ${activeTab === 'active' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
        >
          Active Students ({activeStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 font-bold text-sm border-b-2 text-center transition-all ${activeTab === 'pending' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
        >
          Pending Approvals ({pendingStudents.length})
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead className='bg-slate-200'>
              <tr className="text-slate-500 text-sm uppercase">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                {activeTab === 'pending' && <th className="px-6 py-4 font-medium">Email Status</th>}
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={activeTab === 'pending' ? "6" : "5"} className="px-6 py-8 text-center text-slate-500 animate-pulse">Loading students...</td></tr>
              ) : displayedStudents.length === 0 ? (
                <tr><td colSpan={activeTab === 'pending' ? "6" : "5"} className="px-6 py-8 text-center text-slate-500">No students found.</td></tr>
              ) : (
                displayedStudents.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedUser(user)}>
                    <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${user.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase bg-emerald-100 text-emerald-700`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {activeTab === 'pending' && (
                        <button
                          disabled={approveUserMutation.isPending}
                          onClick={() => handleApprove(user._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {approveUserMutation.isPending && approveUserMutation.variables === user._id ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                      <button
                        disabled={deleteUserMutation.isPending && deleteUserMutation.variables === user._id}
                        onClick={() => handleDelete(user._id)}
                        className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {deleteUserMutation.isPending && deleteUserMutation.variables === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-blue-600">Student Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-white bg-red-400 hover:bg-red-600 p-1 w-8 rounded transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center border-b pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 text-3xl font-bold uppercase">{selectedUser.name[0]}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{selectedUser.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 mt-1">
                  {selectedUser.role}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{selectedUser.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Stream / Dept</label>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{selectedUser.stream || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Year of Study</label>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{selectedUser.year || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Member Since</label>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">User ID</label>
                    <p className="text-xs font-mono text-slate-500 mt-1 truncate" title={selectedUser._id}>
                      {selectedUser._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 rounded text-white hover:bg-blue-700 bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
