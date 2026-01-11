import React, { useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { generateAIInsight } from '../services/geminiService';
import { StudentWithBalance, Transaction } from '../types';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentWithBalance[];
  transactions: Transaction[];
  initialPrompt?: string;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isOpen, onClose, students, transactions, initialPrompt }) => {
  const [query, setQuery] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    } else if (isOpen) {
      // Reset if opened without prompt
      setQuery('');
      setResponse('');
    }
  }, [isOpen, initialPrompt]);

  // Suggestions for the user
  const suggestions = [
    "Who owes me the most money?",
    "Write a polite payment reminder for John Doe",
    "Summarize my income for this month",
    "List students with negative balance"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setIsLoading(true);
    setResponse('');
    
    const result = await generateAIInsight(text, students, transactions);
    setResponse(result);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[600px] sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 sm:rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Bot size={24} />
            <h2 className="font-bold text-lg">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
          {!response && !isLoading && !query && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try asking one of these:</p>
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(s)}
                  className="w-full text-left p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {query && (
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                {query}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                 <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                 <span className="text-sm text-slate-500 dark:text-slate-400">Thinking...</span>
               </div>
            </div>
          )}

          {response && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[90%] prose prose-sm prose-slate dark:prose-invert">
                <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{response}</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:rounded-b-2xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(query); }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask about fees, reminders..."
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};