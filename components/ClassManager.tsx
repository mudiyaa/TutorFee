import React from 'react';
import { Plus, Trash2, Edit2, Users, AlertTriangle } from 'lucide-react';
import { ClassGroup, FeeType } from '../types';

interface ClassManagerProps {
  classes: ClassGroup[];
  onAddClass: (c: Omit<ClassGroup, 'id'>) => void;
  onDeleteClass: (id: string) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({ classes, onAddClass, onDeleteClass }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    name: '',
    feeType: FeeType.MONTHLY,
    defaultFee: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClass({
      name: formData.name,
      feeType: formData.feeType,
      defaultFee: Number(formData.defaultFee),
      description: formData.description
    });
    setIsModalOpen(false);
    setFormData({ name: '', feeType: FeeType.MONTHLY, defaultFee: '', description: '' });
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDeleteClass(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Classes</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <button 
                onClick={() => setDeleteConfirmationId(cls.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{cls.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{cls.description || "No description"}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                cls.feeType === FeeType.MONTHLY 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
              }`}>
                {cls.feeType === FeeType.MONTHLY ? 'Monthly' : 'Per Session'}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">Rs. {cls.defaultFee}</span>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <Users size={48} className="mb-4 opacity-50" />
            <p>No classes found. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Add New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fee Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.feeType}
                    onChange={e => setFormData({...formData, feeType: e.target.value as FeeType})}
                  >
                    <option value={FeeType.MONTHLY}>Monthly</option>
                    <option value={FeeType.PER_SESSION}>Per Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (Rs.)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.defaultFee}
                    onChange={e => setFormData({...formData, defaultFee: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Class?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};