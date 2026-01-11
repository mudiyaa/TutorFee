import React, { useState } from 'react';
import { Search, Plus, Calendar, DollarSign, User, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { StudentWithBalance, Transaction, TransactionType } from '../types';

interface TransactionManagerProps {
  students: StudentWithBalance[];
  transactions: Transaction[];
  onTransaction: (studentId: string, type: TransactionType, amount: number, note?: string, date?: string) => void;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({ students, transactions, onTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithBalance | null>(null);
  const [type, setType] = useState<TransactionType>(TransactionType.PAYMENT);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount) return;

    onTransaction(selectedStudent.id, type, Number(amount), note, date);
    
    // Reset form
    setAmount('');
    setNote('');
    setSelectedStudent(null);
    setSearchTerm('');
    // Keep date and type as they might be entering multiple similar transactions
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">New Transaction</h1>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Student</label>
              {!selectedStudent ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name or class..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(student);
                              setSearchTerm('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-slate-800 dark:text-white">{student.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{student.className}</div>
                            </div>
                            <div className={`text-sm font-medium ${student.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {student.balance < 0 ? 'Due: ' : 'Credit: '}Rs. {Math.abs(student.balance)}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500">No students found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">{selectedStudent.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{selectedStudent.className}</div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.PAYMENT)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                      type === TransactionType.PAYMENT
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <ArrowDownLeft size={16} />
                    Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.CHARGE)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                      type === TransactionType.CHARGE
                        ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight size={16} />
                    Charge
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount (Rs.)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Note (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. October Fee, Extra Class"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!selectedStudent || !amount}
                className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors ${
                  !selectedStudent || !amount 
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                    : type === TransactionType.PAYMENT 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <Plus size={20} />
                {type === TransactionType.PAYMENT ? 'Record Payment' : 'Add Charge'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map(t => {
              const student = students.find(s => s.id === t.studentId);
              return (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      t.type === TransactionType.PAYMENT 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                    }`}>
                      {t.type === TransactionType.PAYMENT ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{student?.name || 'Unknown Student'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    t.type === TransactionType.PAYMENT ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'
                  }`}>
                    {t.type === TransactionType.PAYMENT ? '+' : '-'}Rs. {t.amount}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};