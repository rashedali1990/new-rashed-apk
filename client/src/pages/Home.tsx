/* ==========================================================
   Home — Obsidian Minimal M3U Player
   Main application layout: sidebar + player + info
   Design: Dark premium, golden amber accents
   ========================================================== */

import { useState, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelList from '@/components/ChannelList';
import LoadPlaylist from '@/components/LoadPlaylist';
import {
  Plus, List, X, ChevronRight, ChevronLeft,
  Radio, Layers, Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function Home() {
  const {
    playlist,
    currentChannel,
    filteredChannels,
    playChannel,
    clearPlaylist,
    isLoading,
  } = usePlayer();

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Play next channel
  const handleNext = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const idx = filteredChannels.findIndex(c => c.id === currentChannel.id);
    const next = filteredChannels[(idx + 1) % filteredChannels.length];
    playChannel(next);
  }, [currentChannel, filteredChannels, playChannel]);

  // Play previous channel
  const handlePrev = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const idx = filteredChannels.findIndex(c => c.id === currentChannel.id);
    const prev = filteredChannels[(idx - 1 + filteredChannels.length) % filteredChannels.length];
    playChannel(prev);
  }, [currentChannel, filteredChannels, playChannel]);

  return (
    <div className="h-screen flex flex-col bg-[#0d0d14] overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/rashid-logo-goNJuaK9VUiStJCUZnpPP5.webp"
            alt="مشغل راشد"
            className="w-7 h-7 object-contain"
          />
          <div className="hidden sm:block">
            <span className="text-white font-bold text-base tracking-tight" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              مشغل <span className="text-amber-400">راشد</span>
            </span>
          </div>
        </div>

        {/* Playlist info */}
        {playlist && (
          <div className="flex items-center gap-2 mr-2">
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1">
              <Layers className="w-3 h-3 text-amber-400/70" />
              <span className="text-white/50 text-xs">{playlist.totalCount} قناة</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 mr-2">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-white/50 text-xs">جاري التحميل...</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {playlist && (
            <>
              {/* Toggle sidebar */}
              <button
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${showSidebar ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-white/5 border-white/8 text-white/50 hover:text-white/70'}`}
                onClick={() => setShowSidebar(prev => !prev)}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">القنوات</span>
              </button>

              {/* Clear playlist */}
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/8 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-all"
                onClick={() => { clearPlaylist(); setShowLoadModal(true); }}
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">مسح</span>
              </button>
            </>
          )}

          {/* Load playlist button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all"
            onClick={() => setShowLoadModal(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{playlist ? 'قائمة جديدة' : 'تحميل قائمة'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Show loading state or player */}
        {isLoading && !playlist ? (
          <LoadingScreen />
        ) : playlist ? (
          <>
            {/* Sidebar — Channel List */}
            {showSidebar && (
              <aside className="w-64 xl:w-72 flex-shrink-0 flex flex-col border-l border-white/5 overflow-hidden">
                <ChannelList />
              </aside>
            )}

            {/* Player Area */}
            <main className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
              {/* Video Player */}
              <div className="flex-shrink-0">
                <VideoPlayer channel={currentChannel} onNext={handleNext} />
              </div>

              {/* Channel Info & Navigation */}
              {currentChannel && (
                <div className="flex items-start gap-4 flex-shrink-0">
                  {/* Channel details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {currentChannel.logo && (
                        <img
                          src={currentChannel.logo}
                          alt={currentChannel.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div className="min-w-0">
                        <h1 className="text-white font-bold text-lg leading-tight truncate">{currentChannel.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {currentChannel.group && (
                            <span className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {currentChannel.group}
                            </span>
                          )}
                          {currentChannel.language && (
                            <span className="text-xs text-white/30">{currentChannel.language}</span>
                          )}
                          {currentChannel.country && (
                            <span className="text-xs text-white/30">{currentChannel.country}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white transition-all"
                      onClick={handlePrev}
                      title="القناة السابقة"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white transition-all"
                      onClick={handleNext}
                      title="القناة التالية"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile channel list toggle */}
              <div className="md:hidden flex-1 overflow-hidden border border-white/5 rounded-xl">
                <ChannelList />
              </div>
            </main>
          </>
        ) : (
          <EmptyState onLoad={() => setShowLoadModal(true)} />
        )}
      </div>

      {/* Load Playlist Modal */}
      <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
        <DialogContent className="bg-[#0d0d14] border border-white/10 shadow-2xl p-0 max-w-lg overflow-hidden">
          <DialogTitle className="sr-only">تحميل قائمة M3U</DialogTitle>
          <LoadPlaylist onClose={() => setShowLoadModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Loading screen shown while fetching playlist */
function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/hero-bg-EaXFpnJ6oDpc8bq53EQYaf.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14]/60 to-[#0d0d14]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
        <div>
          <p className="text-white/70 text-lg font-medium">جاري تحميل القائمة...</p>
          <p className="text-white/40 text-sm mt-2">يرجى الانتظار</p>
        </div>
      </div>
    </div>
  );
}

/* Empty state shown when no playlist is loaded */
function EmptyState({ onLoad }: { onLoad: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/hero-bg-EaXFpnJ6oDpc8bq53EQYaf.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14]/60 to-[#0d0d14]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/rashid-logo-goNJuaK9VUiStJCUZnpPP5.webp"
          alt="مشغل راشد"
          className="w-20 h-20 object-contain"
        />

        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            مشغل <span className="text-amber-400">راشد</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            مشغل IPTV احترافي يدعم قوائم M3U وM3U8
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { icon: <Radio className="w-5 h-5" />, label: 'بث مباشر', desc: 'HLS & RTMP' },
            { icon: <List className="w-5 h-5" />, label: 'قوائم ضخمة', desc: 'آلاف القنوات' },
            { icon: <Layers className="w-5 h-5" />, label: 'تصفية ذكية', desc: 'بحث وفئات' },
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-xl p-3 flex flex-col items-center gap-2">
              <div className="text-amber-400/70">{f.icon}</div>
              <p className="text-white/70 text-xs font-medium">{f.label}</p>
              <p className="text-white/30 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        <button
          className="flex items-center gap-2 px-8 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold rounded-xl transition-all golden-glow hover:scale-105 active:scale-95"
          onClick={onLoad}
        >
          <Plus className="w-5 h-5" />
          تحميل قائمة M3U
        </button>

        <p className="text-white/20 text-xs">
          يدعم روابط URL والملفات المحلية (.m3u, .m3u8)
        </p>
      </div>
    </div>
  );
}
