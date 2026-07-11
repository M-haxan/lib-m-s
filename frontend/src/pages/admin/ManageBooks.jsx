import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchBooks = async () => {
  const { data } = await axios.get('/api/books');
  return data;
};

export default function ManageBooks() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: '', publisher: '', year: '', quantity: '', imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
    staleTime: 30000,
  });

  const createOrUpdateBookMutation = useMutation({
    mutationFn: async (payload) => {
      if (editId) {
        return axios.put(`/api/books/${editId}`, payload, { withCredentials: true });
      }
      return axios.post('/api/books', payload, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowModal(false);
      setFormData({ title: '', author: '', isbn: '', category: '', publisher: '', year: '', quantity: '', imageUrl: '' });
      setEditId(null);
      toast.success(editId ? 'Book updated successfully' : 'Book added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id) => axios.delete(`/api/books/${id}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'library_preset');
    data.append('cloud_name', 'dzizbm5s7');

    try {
      setUploading(true);
      const res = await fetch('https://api.cloudinary.com/v1_1/dzizbm5s7/image/upload', {
        method: 'POST',
        body: data
      });
      const resData = await res.json();
      setFormData({ ...formData, imageUrl: resData.secure_url });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createOrUpdateBookMutation.mutate(formData);
  };

  const handleEdit = (book) => {
    setEditId(book._id);
    setFormData(book);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    deleteBookMutation.mutate(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manage Books</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Add, update, or remove books from the library catalog.</p>
        </div>
        <button
          onClick={() => { setEditId(null); setFormData({ title: '', author: '', isbn: '', category: '', publisher: '', year: '', quantity: '', imageUrl: '' }); setShowModal(true); }}
          className="px-6 py-3 bg-blue-500 text-white rounded shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all font-medium"
        >
          + Add New Book
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Cover</th>
                <th className="px-6 py-4 font-medium">Book Details</th>
                <th className="px-8 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 animate-pulse">Loading books...</td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No books found. Add some!</td></tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-500 font-bold capitalize">{book.title}</div>
                      <div className="text-sm text-slate-500">by {book.author}</div>
                      <div className="text-xs text-slate-500 mt-1">ISBN: {book.isbn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-white bg-blue-600 rounded text-xs font-medium">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-500">Total: {book.quantity}</div>
                      <div className={`text-sm font-medium ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Available: {book.availableCopies}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(book)} className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium transition-colors">Edit</button>
                      <button onClick={() => handleDelete(book._id)} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 text-sm font-medium transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editId ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Book Title</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Author</label>
                  <input required type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ISBN</label>
                  <input required type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Publisher</label>
                  <input required type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Publication Year</label>
                  <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Quantity</label>
                  <input required type="number" name="quantity" min="0" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Book Cover Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-300 transition-all" />
                  {uploading && <p className="text-xs text-blue-600 mt-1 animate-pulse">Uploading image to Cloudinary...</p>}
                </div>
              </div>

              {formData.imageUrl && (
                <div className="mt-4 flex justify-center">
                  <img src={formData.imageUrl} alt="Preview" className="h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-1" />
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                <button disabled={uploading} type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all font-medium disabled:opacity-50">
                  {editId ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
