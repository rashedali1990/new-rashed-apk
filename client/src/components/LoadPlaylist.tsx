/* ==========================================================
   LoadPlaylist — Obsidian Minimal M3U Player
   Modal/panel for loading M3U playlists via URL or file
   ========================================================== */

import { useState, useRef, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Link2, Upload, Loader2, X, Plus, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface LoadPlaylistProps {
  onClose?: () => void;
}

export default function LoadPlaylist({ onClose }: LoadPlaylistProps) {
  const { loadFromUrl, loadFromFile, isLoading, savedPlaylists, savePlaylist, removeSavedPlaylist } = usePlayer();
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
  const [showSaved, setShowSaved] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isProxyLoading, setIsProxyLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const m3uFetch = trpc.m3u.fetch.useQuery(
    { url, username, password },
    { enabled: false, retry: false }
  );

  const handleLoadUrl = async () => {
    if (!url.trim()) {
      toast.error('يرجى إدخال رابط القائمة');
      return;
    }
    try {
      setIsProxyLoading(true);
      const result = await m3uFetch.refetch();
      if (result.data?.success && result.data?.content) {
        await loadFromUrl(result.data.content);
        if (playlistName.trim()) {
          savePlaylist(playlistName.trim(), url.trim());
        }
        toast.success('تم تحميل القائمة بنجاح');
        onClose?.();
      } else {
        toast.error('فشل تحميل القائمة');
      }
    } catch (error) {
      toast.error('فشل تحميل القائمة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setIsProxyLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFromFile(file);
      toast.success(`تم تحميل "${file.name}" بنجاح`);
      onClose?.();
    } catch {
      toast.error('فشل قراءة الملف');
    }
  };

  const handleLoadSaved = async (savedUrl: string) => {
    try {
      await loadFromUrl(savedUrl);
      toast.success('تم تحميل القائمة');
      onClose?.();
    } catch {
      toast.error('فشل تحميل القائمة');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <h2 className="text-white font-semibold text-base">تحميل قائمة M3U</h2>
          <p className="text-white/40 text-xs mt-0.5">أضف رابطاً أو ارفع ملفاً</p>
        </div>
        {onClose && (
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors" onClick={onClose}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'url' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white/60'}`}
            onClick={() => setActiveTab('url')}
          >
            <Link2 className="w-3.5 h-3.5" />
            رابط URL
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'file' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white/60'}`}
            onClick={() => setActiveTab('file')}
          >
            <Upload className="w-3.5 h-3.5" />
            ملف محلي
          </button>
        </div>

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">رابط القائمة *</label>
              <input
                type="url"
                placeholder="https://example.com/playlist.m3u"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLoadUrl()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">اسم المستخدم (اختياري)</label>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">كلمة المرور (اختياري)</label>
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">اسم القائمة (اختياري — للحفظ)</label>
              <input
                type="text"
                placeholder="مثال: قنواتي المفضلة"
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
              />
            </div>
            <button
              className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleLoadUrl}
              disabled={isLoading || isProxyLoading}
            >
              {isLoading || isProxyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isLoading || isProxyLoading ? 'جارٍ التحميل...' : 'تحميل القائمة'}
            </button>
          </div>
        )}

        {/* File Tab */}
        {activeTab === 'file' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".m3u,.m3u8,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className={`w-full py-10 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 transition-all cursor-pointer ${
                isDragging
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange({ target: { files: e.dataTransfer.files } } as any);
              }}
            >
              <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-amber-400' : 'text-white/25'}`} />
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium">{isDragging ? 'أفلت الملف هنا' : 'اضغط أو اسحب ملفاً'}</p>
                <p className="text-white/25 text-xs mt-1">يدعم .m3u و .m3u8</p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Playlists */}
        {savedPlaylists.length > 0 && (
          <div>
            <button
              className="w-full flex items-center justify-between text-xs text-white/40 hover:text-white/60 transition-colors mb-2"
              onClick={() => setShowSaved(prev => !prev)}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                القوائم المحفوظة ({savedPlaylists.length})
              </span>
              {showSaved ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showSaved && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {savedPlaylists.map(sp => (
                  <div
                    key={sp.id}
                    className="flex items-center gap-2 bg-white/4 hover:bg-white/6 border border-white/6 rounded-xl px-3 py-2 group transition-all"
                  >
                    <button
                      className="flex-1 text-right min-w-0"
                      onClick={() => handleLoadSaved(sp.url)}
                    >
                      <p className="text-white/70 text-sm font-medium truncate">{sp.name}</p>
                      <p className="text-white/25 text-xs truncate" dir="ltr">{sp.url}</p>
                    </button>
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeSavedPlaylist(sp.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
