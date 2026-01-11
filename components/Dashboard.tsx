import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Bell, Download, Calendar, Activity } from 'lucide-react';
import { StudentWithBalance, Transaction, TransactionType } from '../types';

interface DashboardProps {
  students: StudentWithBalance[];
  transactions: Transaction[];
  onGenerateReminder: (studentName: string, amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, transactions, onGenerateReminder }) => {
  
  // --- Summary Calculations ---

  // 1. Total Overdue (Pending)
  const totalPending = students.reduce((acc, s) => acc + (s.balance < 0 ? Math.abs(s.balance) : 0), 0);
  const defaulters = students.filter(s => s.balance < 0);

  // 2. Today's Income
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIncome = transactions
    .filter(t => t.type === TransactionType.PAYMENT && t.date.startsWith(todayStr))
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. Total Income (All Time)
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.PAYMENT)
    .reduce((acc, t) => acc + t.amount, 0);

  // 4. Monthly Income (For charts & average calc)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyIncome = transactions
    .filter(t => t.type === TransactionType.PAYMENT && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // 5. Average Per Day Income (Current Month)
  const currentDay = new Date().getDate();
  const avgDailyIncome = Math.round(monthlyIncome / (currentDay || 1));

  // --- Chart Data ---
  const chartData = React.useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      
      const income = transactions
        .filter(t => t.type === TransactionType.PAYMENT && t.date.startsWith(monthKey))
        .reduce((acc, t) => acc + t.amount, 0);
        
      data.push({ name: monthLabel, income });
    }
    return data;
  }, [transactions]);

  const StatCard = ({ title, value, subtext, icon: Icon, color, textColor }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</span>
      </div>
      <h3 className={`text-2xl font-bold ${textColor || 'text-slate-800 dark:text-white'}`}>{value}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
           <span className="text-sm text-slate-500 dark:text-slate-400">Overview of your class finances</span>
        </div>
        <button 
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          onClick={() => alert("This would download a PDF report.")}
        >
          <Download size={18} />
          Download Report
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Income" 
          value={`Rs. ${todayIncome.toLocaleString()}`} 
          subtext="Collected today"
          icon={Calendar}
          color="bg-indigo-500"
          textColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard 
          title="Total Overdue" 
          value={`Rs. ${totalPending.toLocaleString()}`} 
          subtext={`${defaulters.length} students pending`}
          icon={Bell}
          color="bg-rose-500"
          textColor="text-rose-600 dark:text-rose-400"
        />
        <StatCard 
          title="Total Income" 
          value={`Rs. ${totalIncome.toLocaleString()}`} 
          subtext="All time collection"
          icon={DollarSign}
          color="bg-emerald-500"
          textColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard 
          title="Avg. Daily Income" 
          value={`Rs. ${avgDailyIncome.toLocaleString()}`} 
          subtext="For this month"
          icon={Activity}
          color="bg-blue-500"
          textColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            Monthly Income Trend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outstanding Payments Report */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <FileText size={20} className="text-rose-500" />
               Pending Payments
             </h2>
             <span className="text-xs font-semibold px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full">
               {defaulters.length} Students
             </span>
          </div>
          
          <div className="flex-1 overflow-auto -mx-6 px-6">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Due Amount</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {defaulters.length > 0 ? (
                  defaulters.map(s => (
                    <tr key={s.id}>
                      <td className="py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.className}</div>
                      </td>
                      <td className="py-3 font-bold text-rose-600 dark:text-rose-400">
                        Rs. {Math.abs(s.balance)}
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => onGenerateReminder(s.name, s.balance)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          <Bell size={14} />
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      Great job! No pending fees.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {defaulters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => onGenerateReminder("All Students", totalPending)}
                className="w-full py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                Draft Bulk Reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};