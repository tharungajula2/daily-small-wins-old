'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, Plus, Check, Trash2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function TodoPage() {
  const router = useRouter();
  const { todos, addTodo, toggleTodo, deleteTodo } = useRitualStore();
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    addTodo({
      id: generateUUID(),
      user_id: '', // Handled by syncEngine
      task: inputValue.trim(),
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null
    });
    setInputValue('');
  };

  const activeTodos = todos.filter(t => !t.is_completed).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const completedTodos = todos.filter(t => t.is_completed).sort((a, b) => {
    const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <main className="min-h-screen max-w-md mx-auto bg-canvas relative flex flex-col sm:border-x sm:border-muted select-none">
      <header className="pt-10 pb-4 px-6 sticky top-0 bg-canvas/80 backdrop-blur-md z-30 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-primary tracking-tight">To-Do</h1>
        <button 
          onClick={() => router.push('/')} 
          className="w-8 h-8 rounded-full bg-surface border border-muted/50 flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:border-muted active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 px-6 pb-20 flex flex-col gap-6">
        
        {/* Task Input */}
        <form onSubmit={handleAddTask} className="relative group mt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-surface border border-muted/80 rounded-2xl py-4 pl-5 pr-14 text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/10 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-accent-teal text-white rounded-xl disabled:opacity-50 disabled:bg-muted disabled:text-ink-secondary transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {activeTodos.length === 0 && completedTodos.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-60">
              <span className="text-sm font-medium text-ink-secondary">All clear.</span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {activeTodos.map(todo => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className="group bg-surface border border-muted/50 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-6 h-6 rounded-full border-2 border-muted hover:border-accent-teal flex items-center justify-center transition-colors text-transparent hover:text-accent-teal/20"
                  >
                    <Circle className="w-full h-full fill-current" />
                  </button>
                  <span className="text-base text-ink-primary font-medium flex-1 pt-0.5">{todo.task}</span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="w-8 h-8 flex items-center justify-center text-ink-tertiary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {completedTodos.length > 0 && (
            <motion.div layout className="mt-8">
              <div className="px-1 mb-3">
                <span className="text-[10px] tracking-widest text-ink-secondary uppercase font-semibold">Completed</span>
              </div>
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {completedTodos.map(todo => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      layout
                      className="group bg-canvas border border-transparent rounded-2xl p-4 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="w-6 h-6 rounded-full bg-accent-teal border-2 border-accent-teal flex items-center justify-center transition-colors text-white"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                        <span className="text-base text-ink-secondary font-medium flex-1 pt-0.5 line-through decoration-ink-tertiary">{todo.task}</span>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="w-8 h-8 flex items-center justify-center text-ink-tertiary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </main>
  );
}
