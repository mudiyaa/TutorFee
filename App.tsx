import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClassManager } from './components/ClassManager';
import { StudentManager } from './components/StudentManager';
import { TransactionManager } from './components/TransactionManager';
import { AICopilot } from './components/AICopilot';
import { ClassGroup, Student, Transaction, FeeType, TransactionType, StudentWithBalance } from './types';
import { GoogleGenAI } from "@google/genai";

// Mock Data
const MOCK_CLASSES: ClassGroup[] = [
  { id: 'c1', name: 'Grade 10 Math', feeType: FeeType.MONTHLY, defaultFee: 5000, description: 'Tuesday & Thursday Group' },
  { id: 'c2', name: 'Physics Individual', feeType: FeeType.PER_SESSION, defaultFee: 3000, description: 'Advanced Physics' }
];

const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alice Johnson', classId: 'c1', email: 'alice@example.com', joinedDate: '2023-09-01' },
  { id: 's2', name: 'Bob Smith', classId: 'c1', phone: '077-1234567', joinedDate: '2023-09-05' },
  { id: 's3', name: 'Charlie Brown', classId: 'c2', email: 'charlie@example.com', joinedDate: '2023-10-01' }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', studentId: 's1', type: TransactionType.CHARGE, amount: 5000, date: '2023-10-01', note: 'Oct Monthly Fee' },
  { id: 't2', studentId: 's1', type: TransactionType.PAYMENT, amount: 5000, date: '2023-10-05', note: 'Paid via Cash' },
  { id: 't3', studentId: 's2', type: TransactionType.CHARGE, amount: 5000, date: '2023-10-01', note: 'Oct Monthly Fee' },
  // Bob hasn't paid, balance -5000
  { id: 't4', studentId: 's3', type: TransactionType.CHARGE, amount: 3000, date: '2023-10-02', note: 'Session 1' },
  { id: 't5', studentId: 's3', type: TransactionType.CHARGE, amount: 3000, date: '2023-10-09', note: 'Session 2' },
  { id: 't6', studentId: 's3', type: TransactionType.PAYMENT, amount: 6000, date: '2023-10-10', note: 'Paid for 2 sessions' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classes, setClasses] = useState<ClassGroup[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // New state for pre-filling AI with a prompt (e.g., for reminders)
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Computed state: Students with calculated balance
  const studentsWithBalance: StudentWithBalance[] = students.map(s => {
    const studentTrans = transactions.filter(t => t.studentId === s.id);
    const totalCharges = studentTrans.filter(t => t.type === TransactionType.CHARGE).reduce((acc, t) => acc + t.amount, 0);
    const totalPayments = studentTrans.filter(t => t.type === TransactionType.PAYMENT).reduce((acc, t) => acc + t.amount, 0);
    const balance = totalPayments - totalCharges; // Negative means debt
    const className = classes.find(c => c.id === s.classId)?.name || 'Unknown';
    
    // Find last payment date
    const lastPayment = studentTrans
      .filter(t => t.type === TransactionType.PAYMENT)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return { ...s, balance, className, lastPaymentDate: lastPayment?.date };
  });

  // Handlers
  const handleAddClass = (newClass: Omit<ClassGroup, 'id'>) => {
    setClasses([...classes, { ...newClass, id: uuidv4() }]);
  };

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleAddStudent = (newStudent: any) => {
    setStudents([...students, { ...newStudent, id: uuidv4(), joinedDate: new Date().toISOString() }]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    // Delete logic is confirmed in the UI component before calling this
    setStudents(students.filter(s => s.id !== id));
    setTransactions(transactions.filter(t => t.studentId !== id));
  };

  const handleTransaction = (studentId: string, type: TransactionType, amount: number, note?: string, date?: string) => {
    const transaction: Transaction = {
      id: uuidv4(),
      studentId,
      type,
      amount,
      date: date || new Date().toISOString(),
      note
    };
    setTransactions([...transactions, transaction]);
  };

  const handleOpenAIReminder = (studentName: string, amountDue: number) => {
    setAiInitialPrompt(`Draft a polite payment reminder for ${studentName} who owes Rs. ${Math.abs(amountDue)}.`);
    setIsAIModalOpen(true);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onOpenAI={() => {
        setAiInitialPrompt('');
        setIsAIModalOpen(true);
      }}
      isDarkMode={isDarkMode}
      toggleTheme={() => setIsDarkMode(!isDarkMode)}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          students={studentsWithBalance} 
          transactions={transactions} 
          onGenerateReminder={handleOpenAIReminder}
        />
      )}
      {activeTab === 'transactions' && (
        <TransactionManager 
          students={studentsWithBalance}
          transactions={transactions}
          onTransaction={handleTransaction}
        />
      )}
      {activeTab === 'classes' && (
        <ClassManager 
          classes={classes} 
          onAddClass={handleAddClass}
          onDeleteClass={handleDeleteClass}
        />
      )}
      {activeTab === 'students' && (
        <StudentManager 
          students={studentsWithBalance} 
          classes={classes}
          transactions={transactions}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          onTransaction={handleTransaction}
        />
      )}

      <AICopilot 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        students={studentsWithBalance}
        transactions={transactions}
        initialPrompt={aiInitialPrompt}
      />
    </Layout>
  );
};

export default App;