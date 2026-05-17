'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore, PillarId, AnchorType } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const PILLAR_OPTIONS: { id: PillarId; label: string }[] = [
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'movement', label: 'Movement' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'stress_mental', label: 'Stress & Mental' },
  { id: 'social', label: 'Social' },
  { id: 'environment', label: 'Environment' }
];

export default function AnchorManager({ onClose }: { onClose: () => void }) {
  const { anchors, addAnchor, removeAnchor } = useRitualStore();
  const [newTitle, setNewTitle] = useState('');
  const [newPillarId, setNewPillarId] = useState<PillarId>('stress_mental');
  const [newType, setNewType] = useState<AnchorType>('action');
  const [newPrompt, setNewPrompt] = useState('');
  const [newBaseline, setNewBaseline] = useState('');
  
  // Phase 3.5 State Additions
  const [frequency, setFrequency] = useState<string[]>(['all']);
  const [subItems, setSubItems] = useState<{ id: string; title: string }[]>([]);
  const [subItemInput, setSubItemInput] = useState('');

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    if (frequency.includes('all')) {
      setFrequency([day]);
    } else {
      if (frequency.includes(day)) {
        const next = frequency.filter(d => d !== day);
        if (next.length === 0) {
          setFrequency(['all']);
        } else {
          setFrequency(next);
        }
      } else {
        const next = [...frequency, day];
        if (next.length === 7) {
          setFrequency(['all']);
        } else {
          setFrequency(next);
        }
      }
    }
  };

  const setEveryday = () => {
    setFrequency(['all']);
  };

  const addSubItem = () => {
    if (!subItemInput.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      title: subItemInput.trim()
    };
    setSubItems([...subItems, newItem]);
    setSubItemInput('');
  };

  const removeSubItem = (id: string) => {
    setSubItems(subItems.filter(item => item.id !== id));
  };

  const handleSubItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubItem();
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    addAnchor(
      newTitle.trim(),
      newPillarId,
      newType,
      newBaseline.trim() || undefined,
      newType === 'reflection' ? (newPrompt.trim() || undefined) : undefined,
      subItems.length > 0 ? subItems : undefined,
      frequency
    );

    // Reset Forms
    setNewTitle('');
    setNewBaseline('');
    setNewPrompt('');
    setSubItems([]);
    setFrequency(['all']);
  };

  const handleRemove = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    removeAnchor(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/20 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-lg border border-muted max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-ink-primary font-medium">Manage Anchors</h3>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2">
            ✕
          </button>
        </div>

        {/* Existing Anchors List */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {anchors.map((anchor) => (
              <motion.div 
                key={anchor.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-3 bg-canvas border border-muted rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-ink-primary">{anchor.title}</p>
                  <p className="text-xs uppercase tracking-widest text-ink-tertiary">
                    {PILLAR_OPTIONS.find(p => p.id === anchor.pillarId)?.label || anchor.pillarId} • {anchor.type}
                  </p>
                  {anchor.prompt && (
                    <p className="text-xs text-ink-secondary italic mt-0.5">Prompt: "{anchor.prompt}"</p>
                  )}
                  {anchor.subItems && anchor.subItems.length > 0 && (
                    <p className="text-xs text-accent-teal/70 font-semibold mt-0.5">↳ Checklist ({anchor.subItems.length} items)</p>
                  )}
                  {anchor.frequency && anchor.frequency.length > 0 && !anchor.frequency.includes('all') && (
                    <p className="text-[10px] text-ink-secondary mt-0.5">Days: {anchor.frequency.join(', ')}</p>
                  )}
                  {anchor.baselineTitle && (
                    <p className="text-xs text-accent-amber/70 mt-1">↳ {anchor.baselineTitle}</p>
                  )}
                </div>
                <button 
                  onClick={() => handleRemove(anchor.id)}
                  className="text-error/70 hover:text-error text-sm p-2 text-right shrink-0"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {anchors.length === 0 && (
            <p className="text-ink-tertiary text-sm text-center py-4">No anchors set.</p>
          )}
        </div>

        {/* Add New Anchor */}
        <div className="border-t border-muted pt-6">
          <h4 className="text-ink-secondary text-sm mb-4">Add New Anchor</h4>
          
          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Cold Plunge, Read 10 Pages"
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-3"
          />
          
          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Pillar</label>
          <select
            value={newPillarId}
            onChange={(e) => setNewPillarId(e.target.value as PillarId)}
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal mb-3 appearance-none"
          >
            {PILLAR_OPTIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Type</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNewType('action')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newType === 'action' ? 'bg-accent-teal text-surface font-semibold' : 'bg-muted text-ink-secondary'}`}
            >
              Action
            </button>
            <button
              onClick={() => setNewType('reflection')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newType === 'reflection' ? 'bg-accent-teal text-surface font-semibold' : 'bg-muted text-ink-secondary'}`}
            >
              Reflection
            </button>
          </div>

          {newType === 'reflection' && (
            <>
              <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Mindfulness Prompt (Optional)</label>
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="e.g., What did I learn from today's discomfort?"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-3 animate-in slide-in-from-top-1 duration-200"
              />
            </>
          )}

          {newType === 'action' && (
            <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Baseline Title (Optional)</label>
          )}
          {newType === 'action' && (
            <input
              type="text"
              value={newBaseline}
              onChange={(e) => setNewBaseline(e.target.value)}
              placeholder="Baseline fallback (e.g., Read 1 page)"
              className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-4"
            />
          )}

          {/* Phase 3.5: Frequency Selection UI */}
          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-2 ml-1">Schedule Frequency</label>
          <div className="bg-canvas border border-muted rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-muted/50">
              <span className="text-xs text-ink-secondary font-medium">Active Days</span>
              <button
                type="button"
                onClick={setEveryday}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  frequency.includes('all')
                    ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
                    : 'bg-muted text-ink-secondary border border-transparent hover:bg-canvas'
                }`}
              >
                Everyday
              </button>
            </div>
            <div className="flex justify-between items-center px-1">
              {DAYS.map((day) => {
                const isSelected = frequency.includes('all') || frequency.includes(day);
                const isAllActive = frequency.includes('all');
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? isAllActive 
                          ? 'bg-accent-teal/5 text-accent-teal/50 border border-accent-teal/20 cursor-not-allowed'
                          : 'bg-accent-teal text-white shadow-sm'
                        : 'bg-canvas border border-muted text-ink-secondary hover:border-ink-secondary/35'
                    }`}
                    disabled={isAllActive}
                  >
                    {day[0]}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-ink-tertiary text-center mt-2.5">
              {frequency.includes('all') 
                ? 'Active every day of the week.' 
                : `Active on: ${frequency.join(', ')}`}
            </p>
          </div>

          {/* Phase 3.5: Sub-Items (Checklist) dynamic list UI */}
          {newType === 'action' && (
            <div className="bg-canvas border border-muted rounded-xl p-3 mb-4">
              <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-2">Sub-Items / Stack (Optional)</label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={subItemInput}
                  onChange={(e) => setSubItemInput(e.target.value)}
                  onKeyDown={handleSubItemKeyDown}
                  placeholder="e.g., Take creatine, Drink 500ml water"
                  className="flex-1 bg-surface border border-muted rounded-lg p-2.5 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal"
                />
                <button
                  type="button"
                  onClick={addSubItem}
                  disabled={!subItemInput.trim()}
                  className={`px-4 rounded-lg text-xs font-semibold transition-colors ${
                    subItemInput.trim()
                      ? 'bg-accent-teal text-surface hover:bg-accent-teal/95'
                      : 'bg-muted text-ink-tertiary cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>

              {subItems.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {subItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-surface border border-muted/65 rounded-lg">
                      <span className="text-xs text-ink-secondary">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => removeSubItem(item.id)}
                        className="text-error/70 hover:text-error text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-ink-tertiary text-center py-2">No sub-items added. Convert to Checklist by adding items.</p>
              )}
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all ${newTitle.trim() ? 'bg-ink-primary text-surface hover:bg-ink-primary/95' : 'bg-muted text-ink-tertiary cursor-not-allowed'}`}
          >
            Add Anchor
          </button>
        </div>
      </div>
    </motion.div>
  );
}
