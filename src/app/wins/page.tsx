'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ChevronLeft, Sparkles, Plus, Trophy } from 'lucide-react';
import PlaylistCard from '@/components/core/PlaylistCard';
import PlaylistManager from '@/components/widgets/PlaylistManager';


export default function WinsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { playlists } = useRitualStore();
  const [isManagingPlaylists, setIsManagingPlaylists] = useState(false);
  const [playlistMetadata, setPlaylistMetadata] = useState<Record<string, { is_non_negotiable: boolean; baseline_target: number | null }>>({});

  useEffect(() => {
    async function loadMetadata() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data } = await supabase
        .from('user_anchors')
        .select('id, is_non_negotiable, baseline_target')
        .eq('user_id', session.user.id);

      if (data) {
        const metaMap: Record<string, { is_non_negotiable: boolean; baseline_target: number | null }> = {};
        data.forEach(item => {
          metaMap[item.id] = {
            is_non_negotiable: !!item.is_non_negotiable,
            baseline_target: item.baseline_target
          };
        });
        setPlaylistMetadata(metaMap);
      }
    }
    loadMetadata();
  }, [supabase]);

  const activePlaylists = playlists.filter(p => p.isActive !== false);

  // Collect all today's gems
  const allTodayGems = activePlaylists.flatMap(p => p.gems || []);

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative bg-canvas text-ink-primary overflow-hidden sm:border-x sm:border-muted transition-colors duration-500">
      
      {/* Magical Background Elements adapted for standard theme */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-teal/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-accent-teal/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full bg-accent-teal/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50 bg-surface/80 backdrop-blur-xl sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            try { void 0; } catch(e){}
            router.push('/');
          }}
          className="w-10 h-10 flex items-center justify-start text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold tracking-widest uppercase text-ink-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-teal" />
            The Arena
          </h1>
        </div>

        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </header>

      <div className="flex-1 overflow-y-auto pb-32 px-6 pt-6 z-10">
        
        {/* Today's Collection Summary */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-teal/10 to-transparent border border-accent-teal/20 flex items-center justify-center shadow-[0_0_30px_rgba(42,127,127,0.1)] mb-4 relative">
            <Trophy className="w-7 h-7 text-accent-teal" />
            {allTodayGems.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-teal rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {allTodayGems.length}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-light tracking-tight text-ink-primary">
            {allTodayGems.length === 0 ? "Empty Canvas" : "Momentum Building"}
          </h2>
          <p className="text-[11px] uppercase tracking-widest text-ink-secondary mt-2 font-semibold">
            {allTodayGems.length === 0 ? "Capture your first win today" : `${allTodayGems.length} Wins captured today`}
          </p>
        </div>

        {/* Playlists List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-ink-tertiary font-bold">Your Playlists</span>
            <button
              onClick={() => setIsManagingPlaylists(true)}
              className="text-[10px] uppercase tracking-widest text-accent-teal hover:text-[#38a3a3] font-bold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Edit
            </button>
          </div>

          {activePlaylists.length === 0 ? (
            <div className="p-8 rounded-3xl border border-muted/80 bg-surface text-center flex flex-col items-center shadow-sm">
              <Sparkles className="w-6 h-6 text-ink-tertiary mb-3" />
              <p className="text-sm text-ink-secondary mb-4">No playlists yet. Create one to start logging wins.</p>
              <button
                onClick={() => setIsManagingPlaylists(true)}
                className="px-6 py-3 rounded-full bg-accent-teal text-white text-xs font-bold uppercase tracking-widest hover:bg-[#236868] transition-colors shadow-md"
              >
                Create Playlist
              </button>
            </div>
          ) : (
            activePlaylists.map(playlist => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist} 
                metadata={playlistMetadata[playlist.id]} 
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isManagingPlaylists && <PlaylistManager onClose={() => setIsManagingPlaylists(false)} />}
      </AnimatePresence>
    </main>
  );
}
