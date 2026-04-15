/* ==========================================================
   PlayerContext — Obsidian Minimal M3U Player
   Global state management for playlist and playback
   ========================================================== */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Channel, M3UPlaylist, parseM3U } from '@/lib/m3u-parser';

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

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<M3UPlaylist | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('الكل');
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);

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
      channels = channels.filter(ch => ch.group === selectedGroup);
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
