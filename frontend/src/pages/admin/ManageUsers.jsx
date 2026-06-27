import axios from 'axios';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const fetchUsers = async () => {
  const { data } = await axios.get('/api/users', { withCredentials: true });
  return data;
};

export default function ManageUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 30000,
    onError: () => toast.error('Failed to fetch users')
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded shadow-sm border">
        <h1 className="text-3xl font-bold text-slate-500">Registered Users</h1>
        <p className="text-slate-500 mt-1">View all students and administrators.</p>
      </div>

      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead className='bg-slate-100'>
              <tr className="text-slate-500 text-sm uppercase">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 animate-pulse">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdat).toLocaleDateString()}</td>
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
