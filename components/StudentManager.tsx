import React from 'react';
import { Plus, Search, Eye, CreditCard, CalendarPlus, X, Phone, Mail, Clock, Calendar, Trash2, ArrowRight, AlertTriangle, Pencil } from 'lucide-react';
import { StudentWithBalance, ClassGroup, TransactionType, FeeType, Transaction, Student } from '../types';

interface StudentManagerProps {
  students: StudentWithBalance[];
  classes: ClassGroup[];
  transactions: Transaction[];
  onAddStudent: (s: any) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onTransaction: (studentId: string, type: TransactionType, amount: number, note?: string, date?: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ 
  students, classes, transactions, onAddStudent, onUpdateStudent, onDeleteStudent, onTransaction 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentWithBalance | null>(null);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);

  // Delete Confirmation State
  const [deleteConfirmationId, setDeleteConfirmationId] = React.useState<string | null>(null);

  const [transactionModal, setTransactionModal] = React.useState<{
    studentId: string;
    type: TransactionType;
    defaultAmount?: number;
  } | null>(null);

  // Form states
  const [newStudent, setNewStudent] = React.useState({ name: '', classId: '', email: '', phone: '' });
  const [transactionAmount, setTransactionAmount] = React.useState('');
  const [transactionNote, setTransactionNote] = React.useState('');
  const [transactionDate, setTransactionDate] = React.useState(new Date().toISOString().slice(0, 10));

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    setNewStudent({ name: '', classId: '', email: '', phone: '' });
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent(editingStudent);
      setIsEditModalOpen(false);
      // Update the selected student view if open
      if (selectedStudent && selectedStudent.id === editingStudent.id) {
        const updatedClass = classes.find(c => c.id === editingStudent.classId);
        setSelectedStudent({
          ...selectedStudent,
          ...editingStudent,
          className: updatedClass?.name || 'Unknown'
        });
      }
      setEditingStudent(null);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDeleteStudent(deleteConfirmationId);
      setDeleteConfirmationId(null);
      if (selectedStudent?.id === deleteConfirmationId) {
        setSelectedStudent(null);
      }
    }
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionModal) return;
    onTransaction(
      transactionModal.studentId,
      transactionModal.type,
      Number(transactionAmount),
      transactionNote,
      transactionDate
    );
    setTransactionModal(null);
    setTransactionAmount('');
    setTransactionNote('');
    setTransactionDate(new Date().toISOString().slice(0, 10));
  };

  const openTransactionModal = (studentId: string, type: TransactionType, defaultAmount?: number) => {
    setTransactionModal({ studentId, type });
    setTransactionAmount(defaultAmount ? defaultAmount.toString() : '');
    setTransactionDate(new Date().toISOString().slice(0, 10));
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  // Get transactions for selected student
  const selectedStudentTransactions = selectedStudent 
    ? transactions
        .filter(t => t.studentId === selectedStudent.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Students & Payments</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or class..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const classDetails = classes.find(c => c.id === student.classId);
                const isMonthly = classDetails?.feeType === FeeType.MONTHLY;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{student.email || student.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${student.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {student.balance < 0 ? '- ' : '+ '}Rs. {Math.abs(student.balance)}
                      </span>
                      <div className="text-xs text-slate-400">
                        {student.balance < 0 ? 'Owed' : 'Credit'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openTransactionModal(student.id, TransactionType.CHARGE, classDetails?.defaultFee)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                          title={isMonthly ? "Log Monthly Fee" : "Log Session"}
                        >
                          <CalendarPlus size={18} />
                        </button>
                        <button 
                          onClick={() => openTransactionModal(student.id, TransactionType.PAYMENT, Math.abs(Math.min(student.balance, 0)))}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"
                          title="Record Payment"
                        >
                          <CreditCard size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmationId(student.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg ml-2"
                          title="Delete Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Add Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input 
                required placeholder="Full Name" 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
              />
              <select 
                required 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                value={newStudent.classId} onChange={e => setNewStudent({...newStudent, classId: e.target.value})}
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input 
                placeholder="Email (Optional)" type="email"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})}
              />
              <input 
                placeholder="Phone (Optional)" 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Edit Student</h2>
            <form onSubmit={handleUpdateStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Name</label>
                <input 
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Class</label>
                <select 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={editingStudent.classId} onChange={e => setEditingStudent({...editingStudent, classId: e.target.value})}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email</label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={editingStudent.email || ''} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                <input 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={editingStudent.phone || ''} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Update Student</button>
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Student?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this student and all their transaction history? This action cannot be undone.
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedStudent.name}</h2>
                   <button 
                     onClick={() => openEditModal(selectedStudent)}
                     className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                     title="Edit Details"
                   >
                     <Pencil size={16} />
                   </button>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 mt-2">
                  {selectedStudent.className}
                </span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setDeleteConfirmationId(selectedStudent.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                  title="Delete Student"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                     <Mail size={18} />
                     <span>{selectedStudent.email || "No email provided"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                     <Phone size={18} />
                     <span>{selectedStudent.phone || "No phone provided"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                     <Clock size={18} />
                     <span>Joined: {new Date(selectedStudent.joinedDate).toLocaleDateString()}</span>
                   </div>
                 </div>

                 {/* Financial Stats */}
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Balance</p>
                    <p className={`text-3xl font-bold mt-1 ${selectedStudent.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {selectedStudent.balance < 0 ? '-' : '+'}Rs. {Math.abs(selectedStudent.balance)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedStudent.balance < 0 ? 'Payment Overdue' : 'Account in Credit'}
                    </p>
                 </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transaction History</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Note</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedStudentTransactions.length > 0 ? (
                        selectedStudentTransactions.map((t) => (
                          <tr key={t.id}>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {new Date(t.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                t.type === TransactionType.PAYMENT 
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                              }`}>
                                {t.type === TransactionType.PAYMENT ? 'Payment' : 'Charge'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.note || '-'}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                              Rs. {t.amount}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                            No transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {transactionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-white">
              {transactionModal.type === TransactionType.PAYMENT ? 'Record Payment' : 'Add Charge'}
            </h2>
            
            {/* Quick Select specific charges when paying */}
            {transactionModal.type === TransactionType.PAYMENT && (
              <div className="mt-4 mb-4">
                 <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Select a pending charge to pay:</p>
                 <div className="space-y-2 max-h-32 overflow-y-auto">
                   {transactions
                      .filter(t => t.studentId === transactionModal.studentId && t.type === TransactionType.CHARGE)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map(charge => (
                        <button
                          key={charge.id}
                          type="button"
                          onClick={() => {
                            setTransactionAmount(charge.amount.toString());
                            setTransactionNote(`Payment for ${charge.note || 'Charge on ' + new Date(charge.date).toLocaleDateString()}`);
                          }}
                          className="w-full text-left p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group transition-colors"
                        >
                          <div>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{charge.note || 'Class Fee'}</div>
                            <div className="text-[10px] text-slate-400">{new Date(charge.date).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rs. {charge.amount}</span>
                             <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                          </div>
                        </button>
                      ))
                   }
                   {transactions.filter(t => t.studentId === transactionModal.studentId && t.type === TransactionType.CHARGE).length === 0 && (
                     <div className="text-xs text-slate-400 italic">No recent charges found.</div>
                   )}
                 </div>
                 <div className="border-b border-slate-100 dark:border-slate-800 my-4"></div>
              </div>
            )}

            <form onSubmit={handleTransactionSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Amount (Rs.)</label>
                <input 
                  autoFocus
                  required type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-lg font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                  value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Date</label>
                <input 
                  required
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={transactionDate} onChange={e => setTransactionDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Note (Optional)</label>
                <input 
                  type="text"
                  placeholder={transactionModal.type === TransactionType.PAYMENT ? "e.g., Oct Fee" : "e.g., Session 10/24"}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  value={transactionNote} onChange={e => setTransactionNote(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setTransactionModal(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                <button 
                  type="submit" 
                  className={`px-4 py-2 text-white rounded-lg ${
                    transactionModal.type === TransactionType.PAYMENT ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};