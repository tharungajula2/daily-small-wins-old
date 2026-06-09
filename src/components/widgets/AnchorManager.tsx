'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore, AnchorType, PillarId } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  MISSION_CODENAMES, 
  ANCHOR_NAME_SUGGESTIONS, 
  KEEP_DEFINITION_SUGGESTIONS 
} from '@/utils/prompts';
import { PUBLIC_TEMPLATES } from '@/lib/templates';
import { Shield, Sparkles } from 'lucide-react';

export default function AnchorManager({ onClose }: { onClose: () => void }) {
  const { anchors, addAnchor, removeAnchor, renameAnchor, setAnchorCodename, setAnchorKeepDefinition, toggleAnchorActive } = useRitualStore();
  
  const activeAnchorsCount = anchors.filter(a => a.isActive !== false && a.title !== 'Sunday Weekly Debrief').length;

  // Add Anchor form states
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('scratch');
  const [newTitle, setNewTitle] = useState('');
  const [newKeepDefinition, setNewKeepDefinition] = useState('');
  const [newCodename, setNewCodename] = useState('');
  const [frequency, setFrequency] = useState<string[]>(['all']);
  const [bypassCap, setBypassCap] = useState(false);

  // Editing States
  const [editingAnchorId, setEditingAnchorId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCodename, setEditCodename] = useState('');
  const [editKeepDefinition, setEditKeepDefinition] = useState('');

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

  const selectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    if (key === 'scratch') {
      setNewTitle('');
      setNewKeepDefinition('');
      setNewCodename('');
    } else {
      const tmpl = PUBLIC_TEMPLATES.find(t => t.key === key);
      if (tmpl) {
        setNewTitle(tmpl.title);
        setNewKeepDefinition(tmpl.keepDefinition);
        setNewCodename(tmpl.suggestedCodenames[0] || '');
      }
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    const pillarId: PillarId = selectedTemplateKey === 'body-mind' ? 'movement' : 'stress_mental';

    addAnchor(
      newTitle.trim(),
      pillarId,
      'action',
      undefined,
      undefined,
      [],
      frequency,
      newCodename.trim() || null,
      newKeepDefinition.trim() || `Kept: ${newTitle.trim()}`
    );

    // Reset forms
    setNewTitle('');
    setNewKeepDefinition('');
    setNewCodename('');
    setFrequency(['all']);
    setSelectedTemplateKey('scratch');
  };

  const handleRemove = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    removeAnchor(id);
  };

  const handleToggleActive = async (id: string) => {
    const anchor = anchors.find(a => a.id === id);
    if (!anchor) return;
    if (anchor.isActive === false && activeAnchorsCount >= 5) {
      alert("Up to 5 personal promises — keep it focused.");
      return;
    }
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    toggleAnchorActive(id);
  };

  const startEditing = (anchor: any) => {
    setEditingAnchorId(anchor.id);
    setEditTitle(anchor.title);
    setEditCodename(anchor.codename || '');
    setEditKeepDefinition(anchor.keepDefinition || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    renameAnchor(id, editTitle.trim());
    setAnchorCodename(id, editCodename.trim() || null);
    setAnchorKeepDefinition(id, editKeepDefinition.trim());
    setEditingAnchorId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/20 backdrop-blur-sm sm:items-center p-0"
    >
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-lg border border-muted max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-ink-primary font-semibold text-sm">Manage Anchors</h3>
            <p className="text-[10px] text-ink-secondary mt-0.5">Anchors are the few promises that hold your day up. Add up to five.</p>
          </div>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2 focus:outline-none">
            ✕
          </button>
        </div>

        {/* Existing Anchors List */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {anchors.map((anchor) => (
              editingAnchorId === anchor.id ? (
                <motion.div 
                  key={anchor.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-4 bg-canvas border border-accent-teal/30 rounded-xl flex flex-col gap-3.5"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-ink-secondary font-semibold mb-1">
                      Rename Anchor
                    </label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-surface border border-muted rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                    />
                    
                    {/* Anchor Title Suggestions */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ANCHOR_NAME_SUGGESTIONS.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setEditTitle(name)}
                          className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-ink-secondary font-semibold mb-1">
                      Keep Definition
                    </label>
                    <input 
                      type="text"
                      value={editKeepDefinition}
                      onChange={(e) => setEditKeepDefinition(e.target.value)}
                      placeholder="e.g. Read 10 pages today"
                      className="w-full bg-surface border border-muted rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                    />

                    {/* Keep Definition Suggestions */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {KEEP_DEFINITION_SUGGESTIONS.map((keep) => (
                        <button
                          key={keep}
                          type="button"
                          onClick={() => setEditKeepDefinition(keep)}
                          className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all text-left"
                        >
                          {keep}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase tracking-widest text-ink-secondary font-semibold">
                        Mission Codename (Privacy Alias)
                      </label>
                      {editCodename && (
                        <button
                          type="button"
                          onClick={() => setEditCodename('')}
                          className="text-[9px] uppercase tracking-wider font-semibold text-error hover:opacity-80"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input 
                      type="text"
                      value={editCodename}
                      onChange={(e) => setEditCodename(e.target.value)}
                      placeholder="Operation Daybreak, base camp, etc."
                      className="w-full bg-surface border border-muted rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                    />
                    
                    {/* Suggested Codenames */}
                    <div className="mt-2.5">
                      <p className="text-[10px] text-ink-secondary font-semibold uppercase tracking-wider mb-1.5">
                        Suggested Codenames
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {MISSION_CODENAMES.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setEditCodename(name)}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all ${
                              editCodename === name
                                ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30 font-semibold'
                                : 'bg-canvas hover:bg-muted text-ink-primary border border-muted/90'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-1 pt-2.5 border-t border-muted/40">
                    <button
                      type="button"
                      onClick={() => setEditingAnchorId(null)}
                      className="flex-1 py-2 text-xs uppercase tracking-widest font-semibold border border-muted rounded-lg text-ink-secondary hover:text-ink-primary bg-surface transition-all active:scale-98"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(anchor.id)}
                      disabled={!editTitle.trim()}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest font-semibold rounded-lg text-surface transition-all active:scale-98 ${
                        editTitle.trim()
                          ? 'bg-accent-teal hover:bg-accent-teal/95'
                          : 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={anchor.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex items-center justify-between p-3.5 bg-canvas border border-muted rounded-xl animate-in fade-in-20 duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className={`text-sm font-semibold truncate ${anchor.isActive === false ? 'text-ink-secondary line-through' : 'text-ink-primary'}`}>{anchor.title}</p>
                      {anchor.codename && (
                        <span className="text-[10px] text-accent-teal font-semibold italic">
                          ({anchor.codename})
                        </span>
                      )}
                      {anchor.isActive === false && (
                        <span className="text-[8px] tracking-wider uppercase font-semibold text-ink-tertiary bg-muted/60 px-1.5 py-0.5 rounded-sm">
                          Dormant
                        </span>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-widest text-ink-tertiary mt-0.5">
                      Keep: {anchor.keepDefinition || `Complete ${anchor.title}`}
                    </p>
                    {anchor.frequency && anchor.frequency.length > 0 && !anchor.frequency.includes('all') && (
                      <p className="text-[10px] text-ink-secondary mt-0.5">Days: {anchor.frequency.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button 
                      onClick={() => startEditing(anchor)}
                      className="text-accent-teal text-xs font-semibold px-1.5 py-1 hover:opacity-80 focus:outline-none"
                    >
                      Edit
                    </button>
                    <span className="text-ink-tertiary/20 text-xs">|</span>
                    <button 
                      onClick={() => handleToggleActive(anchor.id)}
                      className="text-ink-secondary hover:text-ink-primary text-xs font-semibold px-1.5 py-1 focus:outline-none"
                    >
                      {anchor.isActive !== false ? 'Retire' : 'Activate'}
                    </button>
                    <span className="text-ink-tertiary/20 text-xs">|</span>
                    <button 
                      onClick={() => handleRemove(anchor.id)}
                      className="text-error/70 hover:text-error text-xs px-1.5 py-1 focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          {anchors.length === 0 && (
            <p className="text-ink-secondary text-xs text-center py-6 leading-relaxed max-w-[280px] mx-auto">
              No anchors yet. Start with one — what's the thing that, when you skip it, your whole day quietly falls apart?
            </p>
          )}
        </div>

        {/* Add New Anchor */}
        {activeAnchorsCount >= 5 && !bypassCap ? (
          <div className="border-t border-muted pt-6 text-center flex flex-col items-center gap-3">
            <span className="text-xl select-none">⚓</span>
            <div>
              <h4 className="text-sm font-semibold text-ink-primary">Personal Anchors Cap</h4>
              <p className="text-xs text-ink-secondary leading-relaxed max-w-[280px] mx-auto font-normal mt-1">
                Up to 5 personal anchors — keep it focused.
              </p>
            </div>
            <button
              onClick={() => setBypassCap(true)}
              className="mt-2 text-[10px] uppercase tracking-widest font-semibold text-ink-tertiary hover:text-ink-secondary underline underline-offset-2"
            >
              I understand the risk of clutter, add anyway
            </button>
          </div>
        ) : (
          <div className="border-t border-muted pt-6 flex flex-col gap-4 text-left">
            <h4 className="text-ink-secondary text-sm font-semibold uppercase tracking-wider">Add New Anchor</h4>
            
            {/* Template Selection */}
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-2">
                1. Pick a template
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                <button
                  type="button"
                  onClick={() => selectTemplate('scratch')}
                  className={`p-3 rounded-xl border text-center shrink-0 min-w-[100px] flex flex-col justify-center gap-1 transition-all ${
                    selectedTemplateKey === 'scratch'
                      ? 'bg-accent-teal/5 border-accent-teal text-ink-primary'
                      : 'bg-canvas border-muted text-ink-secondary'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto text-accent-teal" />
                  <span className="text-[10px] font-semibold">Scratch</span>
                </button>

                {PUBLIC_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => selectTemplate(tmpl.key)}
                    className={`p-3 rounded-xl border text-left shrink-0 min-w-[140px] flex flex-col justify-between gap-1 transition-all ${
                      selectedTemplateKey === tmpl.key
                        ? 'bg-accent-teal/5 border-accent-teal text-ink-primary'
                        : 'bg-canvas border-muted text-ink-secondary'
                    }`}
                  >
                    <span className="text-[10px] font-semibold truncate block w-full">{tmpl.title}</span>
                    <span className="text-[8px] opacity-75 line-clamp-2 leading-tight block w-full">{tmpl.keepDefinition}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Name Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-1 ml-1">
                2. Anchor Name / Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Cold Plunge, Read 10 Pages"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal"
              />

              {/* Title Suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {ANCHOR_NAME_SUGGESTIONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setNewTitle(name);
                      setSelectedTemplateKey('scratch');
                    }}
                    className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Keep Definition Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-1 ml-1">
                3. Define your Keep <span className="lowercase font-normal text-ink-secondary text-[9px] tracking-normal">(the one thing that counts as done)</span>
              </label>
              <input
                type="text"
                value={newKeepDefinition}
                onChange={(e) => setNewKeepDefinition(e.target.value)}
                placeholder="What's the one thing that counts as done? (e.g. Read 10 pages)"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal"
              />

              {/* Keep Suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {KEEP_DEFINITION_SUGGESTIONS.map((keep) => (
                  <button
                    key={keep}
                    type="button"
                    onClick={() => {
                      setNewKeepDefinition(keep);
                      setSelectedTemplateKey('scratch');
                    }}
                    className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all text-left"
                  >
                    {keep}
                  </button>
                ))}
              </div>
            </div>

            {/* Codename Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-1 ml-1">
                4. Mission Codename (Optional)
              </label>
              <input
                type="text"
                value={newCodename}
                onChange={(e) => setNewCodename(e.target.value)}
                placeholder="Privacy Alias (e.g. Operation Daybreak)"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal"
              />

              {/* Codename Suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {MISSION_CODENAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNewCodename(name)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all ${
                      newCodename === name
                        ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30 font-semibold'
                        : 'bg-canvas hover:bg-muted text-ink-primary border border-muted/90'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-2 ml-1">
                5. Schedule Frequency
              </label>
              <div className="bg-canvas border border-muted rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-muted/50">
                  <span className="text-xs text-ink-secondary font-semibold">Active Days</span>
                  <button
                    type="button"
                    onClick={setEveryday}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
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
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all text-xs uppercase tracking-widest mt-2 ${
                newTitle.trim() 
                  ? 'bg-ink-primary text-surface hover:bg-ink-primary/95' 
                  : 'bg-muted text-ink-tertiary cursor-not-allowed'
              }`}
            >
              Add Anchor
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
