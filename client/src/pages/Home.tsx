/* ==========================================================
   Home — IPTV Smarters Style M3U Player
   Main dashboard with category cards and navigation
   Design: Dark theme with colorful gradient cards
   ========================================================== */

import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelList from '@/components/ChannelList';
import LoadPlaylist from '@/components/LoadPlaylist';
import {
  Plus, Search, Bell, User, Settings, Grid3x3, BookOpen, Loader2,
  Film, Tv, Radio, Clapperboard
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type ViewMode = 'home' | 'series' | 'movies' | 'live' | 'settings' | 'guide' | 'player';

export default function Home() {
  const {
    playlist,
    currentChannel,
    filteredChannels,
    playChannel,
    setSelectedGroup,
    isLoading,
  } = usePlayer();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category cards for home view
  const categories = [
    {
      id: 'series',
      title: 'مسلسلات',
      icon: Clapperboard,
      gradient: 'from-purple-500 to-blue-500',
      color: 'bg-gradient-to-br from-purple-500 to-blue-500',
    },
    {
      id: 'movies',
      title: 'أفلام',
      icon: Film,
      gradient: 'from-red-500 to-orange-500',
      color: 'bg-gradient-to-br from-red-500 to-orange-500',
    },
    {
      id: 'live',
      title: 'تلفزيون مباشر',
      icon: Tv,
      gradient: 'from-blue-500 to-green-500',
      color: 'bg-gradient-to-br from-blue-500 to-green-500',
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'series': 'مسلسلات',
      'movies': 'أفلام',
      'live': 'قنوات مباشرة',
    };
    setSelectedGroup(categoryMap[categoryId] || 'الكل');
    setViewMode('player');
  };

  // Home view with category cards
  if (viewMode === 'home' && !currentChannel) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a14] overflow-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/rashid-logo-goNJuaK9VUiStJCUZnpPP5.webp"
              alt="مشغل راشد"
              className="w-8 h-8"
            />
            <span className="text-white font-bold text-lg">مشغل راشد</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              />
            </div>

            <button className="p-2 hover:bg-white/5 rounded-lg transition">
              <Bell className="w-5 h-5 text-white/60" />
            </button>

            <button className="p-2 hover:bg-white/5 rounded-lg transition">
              <User className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && !playlist ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-white/60">جاري تحميل القائمة...</p>
              </div>
            </div>
          ) : !playlist ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-white/60">لم يتم تحميل قائمة M3U</p>
              <button
                onClick={() => setShowLoadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                تحميل قائمة
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome section */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك</h1>
                <p className="text-white/60">اختر فئة لبدء المشاهدة</p>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`${cat.color} rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">{cat.title}</h2>
                    </button>
                  );
                })}

                {/* Settings Card */}
                <button
                  onClick={() => setViewMode('settings')}
                  className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg"
                >
                  <Settings className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">الإعدادات</h2>
                </button>

                {/* Multi-Screen Card */}
                <button
                  onClick={() => setViewMode('guide')}
                  className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg"
                >
                  <Grid3x3 className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">شاشة متعددة</h2>
                </button>

                {/* Guide Card */}
                <button
                  onClick={() => setViewMode('guide')}
                  className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg"
                >
                  <BookOpen className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">دليل البرامج</h2>
                </button>
              </div>
            </div>
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

  // Player view
  return (
    <div className="h-screen flex flex-col bg-[#0a0a14] overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => setViewMode('home')}
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/rashid-logo-goNJuaK9VUiStJCUZnpPP5.webp"
            alt="مشغل راشد"
            className="w-8 h-8"
          />
          <span className="text-white font-bold text-lg">مشغل راشد</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLoadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg transition text-sm"
          >
            <Plus className="w-4 h-4" />
            قائمة جديدة
          </button>

          <button className="p-2 hover:bg-white/5 rounded-lg transition">
            <Bell className="w-5 h-5 text-white/60" />
          </button>

          <button className="p-2 hover:bg-white/5 rounded-lg transition">
            <User className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Channel List */}
        <aside className="w-64 flex-shrink-0 border-l border-white/5 overflow-hidden">
          <ChannelList />
        </aside>

        {/* Player Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          {/* Video Player */}
          <div className="flex-shrink-0">
            <VideoPlayer channel={currentChannel} onNext={() => {}} />
          </div>

          {/* Channel Info */}
          {currentChannel && (
            <div className="flex items-start gap-4 flex-shrink-0">
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
                    <h1 className="text-white font-bold text-lg truncate">{currentChannel.name}</h1>
                    {currentChannel.group && (
                      <p className="text-xs text-amber-400/70">{currentChannel.group}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
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
