'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ChevronLeft, Cookie, Sparkles, Plus, Trophy } from 'lucide-react';
import PlaylistCard from '@/components/core/PlaylistCard';
import PlaylistManager from '@/components/widgets/PlaylistManager';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative bg-[#0a0a0c] text-white overflow-hidden sm:border-x sm:border-[#1a1a24]">
      
      {/* Magical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#2A7F7F]/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-[#2A7F7F]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full bg-[#2A7F7F]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-30">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
            router.push('/');
          }}
          className="w-10 h-10 flex items-center justify-start text-white/50 hover:text-white transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold tracking-widest uppercase text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2A7F7F]" />
            The Arena
          </h1>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/vault')}
          className="w-10 h-10 flex items-center justify-end text-white/50 hover:text-amber-500 transition-colors focus:outline-none"
          title="The Vault"
        >
          <Cookie className="w-5 h-5" />
        </motion.button>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 px-6 pt-6 z-10">
        
        {/* Today's Collection Summary */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A7F7F]/20 to-transparent border border-[#2A7F7F]/30 flex items-center justify-center shadow-[0_0_30px_rgba(42,127,127,0.15)] mb-4 relative">
            <Trophy className="w-7 h-7 text-[#2A7F7F]" />
            {allTodayGems.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#2A7F7F] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {allTodayGems.length}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-light tracking-tight text-white/90">
            {allTodayGems.length === 0 ? "Empty Canvas" : "Momentum Building"}
          </h2>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mt-2 font-semibold">
            {allTodayGems.length === 0 ? "Capture your first win today" : `${allTodayGems.length} Wins captured today`}
          </p>
        </div>

        {/* Playlists List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Playlists</span>
            <button
              onClick={() => setIsManagingPlaylists(true)}
              className="text-[10px] uppercase tracking-widest text-[#2A7F7F] hover:text-[#38a3a3] font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Edit
            </button>
          </div>

          {activePlaylists.length === 0 ? (
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] text-center flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-white/20 mb-3" />
              <p className="text-sm text-white/60 mb-4">No playlists yet. Create one to start logging wins.</p>
              <button
                onClick={() => setIsManagingPlaylists(true)}
                className="px-6 py-3 rounded-full bg-[#2A7F7F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#236868] transition-colors"
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
