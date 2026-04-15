/* ==========================================================
   PlayerContext — Obsidian Minimal M3U Player
   Global state management for playlist and playback
   ========================================================== */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Channel, M3UPlaylist, parseM3U, categorizeChannels } from '@/lib/m3u-parser';

interface PlayerContextType {
  playlist: M3UPlaylist | null;
  currentChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedGroup: string;
  filteredChannels: Channel[];
  loadFromText: (text: string) => void;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromFile: (file: File) => Promise<void>;
  playChannel: (channel: Channel) => void;
  setSearchQuery: (q: string) => void;
  setSelectedGroup: (g: string) => void;
  clearPlaylist: () => void;
  savedPlaylists: SavedPlaylist[];
  savePlaylist: (name: string, url: string) => void;
  removeSavedPlaylist: (id: string) => void;
}

interface SavedPlaylist {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = 'm3u-player-saved-playlists';

// Default M3U URL to load automatically
const DEFAULT_M3U_URL = 'http://ddgo770.live:2095/get.php?username=pro770&password=544405320&type=m3u';
const PROXY_ENDPOINT = '/api/trpc/m3u.fetch';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<M3UPlaylist | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('الكل');
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);

  // Load saved playlists from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPlaylists(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const loadFromText = useCallback((text: string) => {
    setError(null);
    try {
      const parsed = parseM3U(text);
      if (parsed.channels.length === 0) {
        setError('لم يتم العثور على قنوات في القائمة');
        return;
      }
      setPlaylist(parsed);
      setSelectedGroup('الكل');
      setSearchQuery('');
    } catch (e) {
      setError('حدث خطأ أثناء تحليل القائمة');
    }
  }, []);

  const loadFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`فشل التحميل: ${response.status}`);
      }
      const text = await response.text();
      loadFromText(text);
    } catch (e: any) {
      setError(e.message || 'فشل تحميل القائمة من الرابط');
    } finally {
      setIsLoading(false);
    }
  }, [loadFromText]);

  // Auto-load default M3U playlist on mount
  useEffect(() => {
    if (!hasLoadedDefault && !playlist) {
      setHasLoadedDefault(true);
      
      // Delay auto-load to allow backend to initialize
      const timer = setTimeout(() => {
        setIsLoading(true);
        setError(null);
        
        // Use the proxy endpoint to fetch the M3U
        fetch(PROXY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'm3u.fetch',
            params: {
              url: DEFAULT_M3U_URL,
              username: 'pro770',
              password: '544405320',
            },
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.result?.success && data.result?.content) {
              loadFromText(data.result.content);
            } else if (data.error) {
              console.error('M3U Fetch error:', data.error);
              setError('فشل تحميل القائمة الافتراضية');
            } else {
              setError('فشل تحميل القائمة الافتراضية');
            }
          })
          .catch(err => {
            console.error('Auto-load error:', err);
            setError('فشل تحميل القائمة الافتراضية');
          })
          .finally(() => setIsLoading(false));
      }, 2000); // Wait 2 seconds for backend to initialize
      
      return () => clearTimeout(timer);
    }
  }, [hasLoadedDefault, playlist, loadFromText]);

  const loadFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      loadFromText(text);
    } catch {
      setError('فشل قراءة الملف');
    } finally {
      setIsLoading(false);
    }
  }, [loadFromText]);

  const playChannel = useCallback((channel: Channel) => {
    setCurrentChannel(channel);
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist(null);
    setCurrentChannel(null);
    setError(null);
    setSearchQuery('');
    setSelectedGroup('الكل');
  }, []);

  const savePlaylist = useCallback((name: string, url: string) => {
    const newEntry: SavedPlaylist = {
      id: Math.random().toString(36).substring(2, 10),
      name,
      url,
      addedAt: Date.now(),
    };
    setSavedPlaylists(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSavedPlaylist = useCallback((id: string) => {
    setSavedPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Filtered channels based on search and group
  const filteredChannels = React.useMemo(() => {
    if (!playlist) return [];
    let channels = playlist.channels;

    if (selectedGroup !== 'الكل') {
      const categories = categorizeChannels(playlist.channels);
      if (selectedGroup in categories) {
        channels = categories[selectedGroup as keyof typeof categories];
      } else {
        channels = channels.filter(ch => ch.group === selectedGroup);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      channels = channels.filter(ch =>
        ch.name.toLowerCase().includes(q) ||
        (ch.tvgName || '').toLowerCase().includes(q) ||
        (ch.group || '').toLowerCase().includes(q)
      );
    }

    return channels;
  }, [playlist, selectedGroup, searchQuery]);

  return (
    <PlayerContext.Provider value={{
      playlist,
      currentChannel,
      isLoading,
      error,
      searchQuery,
      selectedGroup,
      filteredChannels,
      loadFromText,
      loadFromUrl,
      loadFromFile,
      playChannel,
      setSearchQuery,
      setSelectedGroup,
      clearPlaylist,
      savedPlaylists,
      savePlaylist,
      removeSavedPlaylist,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
