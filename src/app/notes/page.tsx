'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, Plus, Trash2, PenLine, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function NotesVaultPage() {
  const router = useRouter();
  const { vaultNotes, addVaultNote, updateVaultNote, deleteVaultNote } = useRitualStore();
  const [mounted, setMounted] = useState(false);
  
  // Editor State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMounted(true), []);

  // Auto-expanding textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  if (!mounted) return null;

  const sortedNotes = [...vaultNotes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const handleOpenEditor = (noteId?: string) => {
    if (noteId) {
      const note = vaultNotes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title || '');
        setContent(note.content);
        setActiveNoteId(noteId);
      }
    } else {
      setTitle('');
      setContent('');
      setActiveNoteId('new');
    }
  };

  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      setActiveNoteId(null);
      return;
    }

    if (activeNoteId === 'new') {
      addVaultNote({
        id: generateUUID(),
        user_id: '',
        title: title.trim() || null,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else if (activeNoteId) {
      updateVaultNote(activeNoteId, {
        title: title.trim() || null,
        content: content.trim()
      });
    }
    
    setActiveNoteId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteVaultNote(id);
  };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-canvas relative flex flex-col sm:border-x sm:border-muted select-none overflow-hidden">
      
      {/* List View */}
      <div className={`flex-1 flex flex-col transition-transform duration-500 ${activeNoteId ? '-translate-x-[20%]' : 'translate-x-0'}`}>
        <header className="pt-10 pb-4 px-6 sticky top-0 bg-canvas/80 backdrop-blur-md z-30 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Vault</h1>
          <button 
            onClick={() => router.push('/')} 
            className="w-8 h-8 rounded-full bg-surface border border-muted/50 flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:border-muted active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 px-6 pb-32 overflow-y-auto mt-4">
          {sortedNotes.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center opacity-60">
              <span className="text-sm font-medium text-ink-secondary">The vault is empty.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {sortedNotes.map(note => (
                  <motion.button
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleOpenEditor(note.id)}
                    className="bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col items-start text-left gap-2 relative group hover:border-accent-teal/30 hover:shadow-md transition-all active:scale-[0.98] h-40 overflow-hidden"
                  >
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-ink-primary truncate tracking-tight">
                        {note.title || 'Untitled'}
                      </h3>
                      <span className="text-[10px] text-ink-tertiary font-medium block mt-0.5 uppercase tracking-wider">
                        {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-ink-secondary leading-relaxed line-clamp-4 flex-1 w-full whitespace-pre-wrap">
                      {note.content}
                    </p>

                    <div 
                      onClick={(e) => handleDelete(note.id, e)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-canvas/80 flex items-center justify-center text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!activeNoteId && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => handleOpenEditor()}
            className="fixed bottom-8 right-6 w-14 h-14 bg-accent-teal text-white rounded-full shadow-[0_8px_30px_rgba(42,127,127,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Editor Overlay */}
      <AnimatePresence>
        {activeNoteId && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-50 bg-canvas flex flex-col"
          >
            <header className="px-4 py-5 flex items-center justify-between sticky top-0 bg-canvas/90 backdrop-blur-sm z-10 border-b border-muted/30">
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 text-accent-teal hover:opacity-80 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">Vault</span>
              </button>
              
              <button 
                onClick={handleSave}
                className="text-xs font-bold text-accent-teal uppercase tracking-widest px-3 py-1.5 bg-accent-teal/10 rounded-full hover:bg-accent-teal/20 transition-colors"
              >
                Save
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-ink-primary placeholder:text-ink-tertiary focus:outline-none tracking-tight"
              />
              <textarea
                ref={textareaRef}
                placeholder="Start writing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 bg-transparent text-base text-ink-primary leading-relaxed placeholder:text-ink-tertiary focus:outline-none resize-none overflow-hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
